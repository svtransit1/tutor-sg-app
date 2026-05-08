const h: ProxyHandler<Record<string,unknown>> = { get:(_,p) => p==='then'?undefined:jest.fn() };
export default new Proxy({}, h);
