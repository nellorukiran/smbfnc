async function closeCustomer(pool, customerId, updatedBy = 'SYSTEM') {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [customerRows] = await connection.query(
      'SELECT customer_id FROM smb_customer_details WHERE customer_id = ?',
      [customerId]
    );

    if (customerRows.length === 0) {
      await connection.rollback();
      return { success: false, status: 404, message: 'Customer not found' };
    }

    await connection.query(
      `UPDATE smb_customer_details
       SET cust_status = ?, updated_by = ?, last_updated_date = NOW()
       WHERE customer_id = ?`,
      ['D', updatedBy, customerId]
    );

    await connection.query('DELETE FROM smb_customer_transactions WHERE customer_id = ?', [customerId]);

    await connection.commit();
    return { success: true, message: 'Customer closed successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  closeCustomer
};
