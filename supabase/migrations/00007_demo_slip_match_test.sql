-- Demo test data: bill 4050 + receiver KHEMPRON NATHONGHO (matches test slip)

update properties
set
  payment_receiver_name = 'KHEMPRON NATHONGHO',
  payment_bank_account = '4081',
  payment_prompt_pay = null
where slug = 'demo-apartment';

update invoices
set
  water_unit = 0,
  electric_unit = 0,
  water_amount = 0,
  electric_amount = 0,
  base_rent_amount = 4050,
  total_amount = 4050,
  status = 'pending',
  slip_image_url = null,
  slip_rejection_note = null
where tenant_id = '00000000-0000-0000-0000-000000000201'
  and billing_month = to_char(now(), 'YYYY-MM');
