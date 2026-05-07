import React, { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { render, screen, fireEvent } from "@testing-library/react-native"
import ErrorBoundary from "../ErrorBoundary"
import {
  HomeworkLLMTimeoutError,
  HomeworkCameraPermissionError,
  HomeworkOCRError,
  HomeworkModelNotDownloadedError,
} from "@/errors/homework-errors"

function ThrowOnCommand({
  error,
  text = "Safe child content",
}: {
  error: Error
  text?: string
}) {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw error
  }

  return (
    <View>
      <Text>{text}</Text>
      <TouchableOpacity
        testID="trigger-error"
        onPress={() => setShouldThrow(true)}
      >
        <Text>Trigger Error</Text>
      </TouchableOpacity>
    </View>
  )
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <Text>Hello homework</Text>
      </ErrorBoundary>,
    )

    expect(screen.getByText("Hello homework")).toBeTruthy()
  })

  it("catches error and shows error UI", () => {
    render(
      <ErrorBoundary>
        <ThrowOnCommand error={new Error("Boom")} />
      </ErrorBoundary>,
    )

    fireEvent.press(screen.getByTestId("trigger-error"))

    expect(screen.queryByText("Safe child content")).toBeNull()
    expect(
      screen.getByText("homeworkError.UNKNOWN.title"),
    ).toBeTruthy()
  })

  it("calls onError when an error is caught", () => {
    const onError = jest.fn()
    render(
      <ErrorBoundary onError={onError}>
        <ThrowOnCommand error={new Error("Boom")} />
      </ErrorBoundary>,
    )

    fireEvent.press(screen.getByTestId("trigger-error"))

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Boom" }),
    )
  })

  describe("known error types", () => {
    it("shows LLM_TIMEOUT title and retry button", () => {
      render(
        <ErrorBoundary onRetry={jest.fn()}>
          <ThrowOnCommand error={new HomeworkLLMTimeoutError()} />
        </ErrorBoundary>,
      )

      fireEvent.press(screen.getByTestId("trigger-error"))

      expect(
        screen.getByText("homeworkError.LLM_TIMEOUT.title"),
      ).toBeTruthy()
      expect(
        screen.getByText("homeworkError.LLM_TIMEOUT.body"),
      ).toBeTruthy()
      expect(screen.getByText("homeworkError.retry")).toBeTruthy()
    })

    it("shows CAMERA_PERMISSION_DENIED with manual input and retry", () => {
      render(
        <ErrorBoundary
          onRetry={jest.fn()}
          onManualInput={jest.fn()}
        >
          <ThrowOnCommand
            error={new HomeworkCameraPermissionError()}
          />
        </ErrorBoundary>,
      )

      fireEvent.press(screen.getByTestId("trigger-error"))

      expect(
        screen.getByText("homeworkError.CAMERA_PERMISSION_DENIED.title"),
      ).toBeTruthy()
      expect(screen.getByText("homeworkError.manualInput")).toBeTruthy()
      expect(screen.getByText("homeworkError.retry")).toBeTruthy()
    })

    it("shows OCR_FAILURE with manual input and retry", () => {
      render(
        <ErrorBoundary
          onRetry={jest.fn()}
          onManualInput={jest.fn()}
        >
          <ThrowOnCommand error={new HomeworkOCRError()} />
        </ErrorBoundary>,
      )

      fireEvent.press(screen.getByTestId("trigger-error"))

      expect(
        screen.getByText("homeworkError.OCR_FAILURE.title"),
      ).toBeTruthy()
      expect(screen.getByText("homeworkError.manualInput")).toBeTruthy()
    })

    it("shows MODEL_NOT_DOWNLOADED with retry only", () => {
      render(
        <ErrorBoundary onRetry={jest.fn()}>
          <ThrowOnCommand
            error={new HomeworkModelNotDownloadedError()}
          />
        </ErrorBoundary>,
      )

      fireEvent.press(screen.getByTestId("trigger-error"))

      expect(
        screen.getByText("homeworkError.MODEL_NOT_DOWNLOADED.title"),
      ).toBeTruthy()
      expect(screen.getByText("homeworkError.retry")).toBeTruthy()
      expect(
        screen.queryByText("homeworkError.manualInput"),
      ).toBeNull()
    })
  })

  describe("recovery", () => {
    it("clears error and re-renders children on retry", () => {
      const onRetry = jest.fn()
      render(
        <ErrorBoundary onRetry={onRetry}>
          <ThrowOnCommand error={new HomeworkLLMTimeoutError()} />
        </ErrorBoundary>,
      )

      fireEvent.press(screen.getByTestId("trigger-error"))
      expect(
        screen.getByText("homeworkError.LLM_TIMEOUT.title"),
      ).toBeTruthy()

      fireEvent.press(screen.getByText("homeworkError.retry"))

      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(screen.getByText("Safe child content")).toBeTruthy()
      expect(
        screen.queryByText("homeworkError.LLM_TIMEOUT.title"),
      ).toBeNull()
    })

    it("clears error and calls onManualInput", () => {
      const onManualInput = jest.fn()
      render(
        <ErrorBoundary onManualInput={onManualInput}>
          <ThrowOnCommand error={new HomeworkOCRError()} />
        </ErrorBoundary>,
      )

      fireEvent.press(screen.getByTestId("trigger-error"))
      fireEvent.press(screen.getByText("homeworkError.manualInput"))

      expect(onManualInput).toHaveBeenCalledTimes(1)
      expect(screen.getByText("Safe child content")).toBeTruthy()
    })

    it("retry is callable even without onRetry prop", () => {
      render(
        <ErrorBoundary>
          <ThrowOnCommand error={new HomeworkLLMTimeoutError()} />
        </ErrorBoundary>,
      )

      fireEvent.press(screen.getByTestId("trigger-error"))
      fireEvent.press(screen.getByText("homeworkError.retry"))

      expect(screen.getByText("Safe child content")).toBeTruthy()
    })
  })

  it("renders accessibility alert role on error", () => {
    render(
      <ErrorBoundary>
        <ThrowOnCommand error={new Error("Test")} />
      </ErrorBoundary>,
    )

    fireEvent.press(screen.getByTestId("trigger-error"))

    expect(screen.getByTestId("error-boundary-card")).toBeTruthy()
  })

  it("does not lose error details for OCR with item count", () => {
    render(
      <ErrorBoundary onRetry={jest.fn()} onManualInput={jest.fn()}>
        <ThrowOnCommand
          error={new HomeworkOCRError("Cannot read 3 items", 3)}
        />
      </ErrorBoundary>,
    )

    fireEvent.press(screen.getByTestId("trigger-error"))

    expect(
      screen.getByText("homeworkError.OCR_FAILURE.title"),
    ).toBeTruthy()
  })
})
