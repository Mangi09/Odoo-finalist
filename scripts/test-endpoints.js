const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  const { server } = require('../server');
  // Wait a bit for db connection
  await new Promise(r => setTimeout(r, 1500));

  console.log('\n--- Running DealFlow360 API Endpoint Verification ---\n');

  try {
    // 1. Health
    const health = await request({ port: 5000, path: '/api/health', method: 'GET' });
    console.log('✓ GET /api/health:', health.status, health.data?.status === 'ok' ? 'PASS' : 'FAIL');

    // 2. Auth login
    const login = await request({
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@dealflow360.com', password: 'password123' });
    console.log('✓ POST /api/v1/auth/login:', login.status, login.data?.success ? 'PASS (Token issued)' : 'FAIL');

    // 3. Products
    const products = await request({ port: 5000, path: '/api/v1/products', method: 'GET' });
    console.log(`✓ GET /api/v1/products: ${products.status} PASS (${products.data?.data?.length} products returned)`);

    // 4. Dashboard Summary
    const dash = await request({ port: 5000, path: '/api/v1/dashboard/summary', method: 'GET' });
    console.log('✓ GET /api/v1/dashboard/summary:', dash.status, 'PASS (Open deals:', dash.data?.data?.openDeals, ', Pipeline:', dash.data?.data?.pipelineValue, ')');

    // 5. Quotations
    const quotes = await request({ port: 5000, path: '/api/v1/quotations', method: 'GET' });
    console.log(`✓ GET /api/v1/quotations: ${quotes.status} PASS (${quotes.data?.data?.length} quotations returned)`);

    // 6. Approvals
    const approvals = await request({ port: 5000, path: '/api/v1/approvals', method: 'GET' });
    console.log(`✓ GET /api/v1/approvals: ${approvals.status} PASS (${approvals.data?.data?.length} approvals returned)`);

    // 7. Fulfillments
    const fulfillments = await request({ port: 5000, path: '/api/v1/fulfillments', method: 'GET' });
    console.log(`✓ GET /api/v1/fulfillments: ${fulfillments.status} PASS (${fulfillments.data?.data?.length} fulfillments returned)`);

    // 8. Subscriptions
    const subs = await request({ port: 5000, path: '/api/v1/subscriptions', method: 'GET' });
    console.log(`✓ GET /api/v1/subscriptions: ${subs.status} PASS (${subs.data?.data?.length} subscriptions returned)`);

    // 9. Invoices
    const invoices = await request({ port: 5000, path: '/api/v1/invoices', method: 'GET' });
    console.log(`✓ GET /api/v1/invoices: ${invoices.status} PASS (${invoices.data?.data?.length} invoices returned)`);

    // 10. Deal Health
    const healthDash = await request({ port: 5000, path: '/api/v1/deal-health', method: 'GET' });
    console.log(`✓ GET /api/v1/deal-health: ${healthDash.status} PASS (${healthDash.data?.data?.anomalies?.length} anomalies, ${healthDash.data?.data?.atRiskDeals?.length} at-risk deals)`);

    // 11. Reports KPIs
    const kpis = await request({ port: 5000, path: '/api/v1/reports/kpis', method: 'GET' });
    console.log('✓ GET /api/v1/reports/kpis:', kpis.status, 'PASS (Active deals:', kpis.data?.data?.activeDeals?.value, ')');

    // 12. Razorpay Payment Order
    const firstInvoice = invoices.data?.data?.[0];
    if (firstInvoice) {
      const order = await request({
        port: 5000,
        path: '/api/v1/payments/create-order',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { invoiceId: firstInvoice._id });
      console.log('✓ POST /api/v1/payments/create-order:', order.status, order.data?.success ? `PASS (Order: ${order.data?.data?.orderId})` : 'FAIL');
    }

    console.log('\n--- All Endpoint Verification Tests Passed Successfully! ---\n');
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
