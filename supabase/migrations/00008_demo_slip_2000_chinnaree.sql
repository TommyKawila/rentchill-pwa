-- Update demo test: bill 2000 + receiver CHINNAREE RATCHARIT

update properties
set
  payment_receiver_name = 'CHINNAREE RATCHARIT',
  payment_bank_account = null,
  payment_prompt_pay = null
where slug = 'demo-apartment';

update invoices
set
  water_unit = 0,
  electric_unit = 0,
  water_amount = 0,
  electric_amount = 0,
  base_rent_amount = 2000,
  total_amount = 2000,
  status = 'pending',
  slip_image_url = null,
  slip_rejection_note = null
where tenant_id = '00000000-0000-0000-0000-000000000201'
  and billing_month = to_char(now(), 'YYYY-MM');
