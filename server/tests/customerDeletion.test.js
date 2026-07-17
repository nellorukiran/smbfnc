const test = require('node:test');
const assert = require('node:assert/strict');
const { closeCustomer } = require('../services/customerDeletion');

test('closeCustomer marks the customer as closed and removes transaction rows', async () => {
  const operations = [];
  const connection = {
    beginTransaction: async () => operations.push('beginTransaction'),
    query: async (sql, params) => {
      operations.push({ sql, params });
      if (sql.includes('SELECT customer_id')) {
        return [[{ customer_id: 'C100' }]];
      }
      return [];
    },
    commit: async () => operations.push('commit'),
    rollback: async () => operations.push('rollback'),
    release: () => operations.push('release')
  };

  const pool = {
    getConnection: async () => connection
  };

  const result = await closeCustomer(pool, 'C100', 'admin');

  assert.equal(result.success, true);
  assert.equal(result.message, 'Customer closed successfully');
  const executedQueries = operations.filter((item) => typeof item === 'object').map((item) => item.sql);

  assert.equal(executedQueries[0], 'SELECT customer_id FROM smb_customer_details WHERE customer_id = ?');
  assert.match(executedQueries[1], /UPDATE smb_customer_details/i);
  assert.match(executedQueries[1], /cust_status = \?/, 'The customer status should be updated');
  assert.equal(executedQueries[2], 'DELETE FROM smb_customer_transactions WHERE customer_id = ?');
});
