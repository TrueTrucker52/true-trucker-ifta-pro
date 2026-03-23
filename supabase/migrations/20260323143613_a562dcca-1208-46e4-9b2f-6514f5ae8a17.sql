CREATE POLICY "referrers_read_own_referrals"
ON referrals
FOR SELECT
TO authenticated
USING (referrer_id = auth.uid());