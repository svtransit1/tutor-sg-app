jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>()
  return {
    getItemAsync: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      store.set(key, value)
      return Promise.resolve()
    }),
    deleteItemAsync: jest.fn((key: string) => {
      store.delete(key)
      return Promise.resolve()
    }),
    __RESET: () => store.clear(),
  }
})

import React from 'react'
import { View, Text } from 'react-native'
import { render, act } from '@testing-library/react-native'
import { PinGateProvider, usePinGate } from '../pin-context'

function TestConsumer() {
  const gate = usePinGate()
  return (
    <View>
      <Text testID="status">{gate.status}</Text>
      <Text testID="attempts">{String(gate.attemptsRemaining)}</Text>
      <Text testID="cooldown">{String(gate.cooldownRemaining)}</Text>
      {gate.error && <Text testID="error">{gate.error}</Text>}
    </View>
  )
}

function setup() {
  return render(
    <PinGateProvider>
      <TestConsumer />
    </PinGateProvider>,
  )
}

describe('PinGateProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const SecureStore = require('expo-secure-store')
    SecureStore.__RESET()
  })

  it('shows needs-setup when no PIN is stored', async () => {
    const { findByTestId } = setup()
    const status = await findByTestId('status')
    expect(status.children[0]).toBe('needs-setup')
  })

  it('shows needs-verify when PIN is stored', async () => {
    const SecureStore = require('expo-secure-store')
    await SecureStore.setItemAsync('parent.pin', '1234')
    await SecureStore.setItemAsync('parent.pin_set', 'true')

    const { findByTestId } = setup()
    const status = await findByTestId('status')
    expect(status.children[0]).toBe('needs-verify')
  })

  it('shows needs-setup after handleResetPin clears PIN', async () => {
    const SecureStore = require('expo-secure-store')
    await SecureStore.setItemAsync('parent.pin', '1234')
    await SecureStore.setItemAsync('parent.pin_set', 'true')

    let gate: any
    function CaptureConsumer() {
      gate = usePinGate()
      return (
        <View>
          <Text testID="s">{gate.status}</Text>
        </View>
      )
    }
    render(
      <PinGateProvider>
        <CaptureConsumer />
      </PinGateProvider>,
    )

    await act(async () => {
      await gate.handleResetPin()
    })
    expect(gate.status).toBe('needs-setup')
  })
})
