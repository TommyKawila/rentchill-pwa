-- Fix superadmin password hash (rentchill-admin)
update owners
set password_hash = 'cad359cf35bb5676dde343294f5df503:f60570aefb72160c5f8a5d155831bf8542873eaaf80095457496b554a877f056cb13931258994959c3b730a236fc2b761b01cfbd1fbf302f2bce89c8e0399f11'
where email = 'admin@rentchill.local';
