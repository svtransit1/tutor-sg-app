export const createClient = jest.fn(() => ({
  auth: {
    signInWithOtp: jest.fn(),
    signInWithOAuth: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(), order: jest.fn() })) })),
    insert: jest.fn(() => ({ select: jest.fn() })),
    update: jest.fn(() => ({ eq: jest.fn() })),
    delete: jest.fn(() => ({ eq: jest.fn() })),
  })),
}));
