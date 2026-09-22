-- Stage B. Source: vonfxl/Operation-ID @ bef8b2b517ccf24b6977071b3817aff561e44295
-- Preserve all 27 GUIDE_DATA.special strings verbatim (25 defaults + 2 overrides).
-- Source URLs: California's embedded URL and app.js U.nj. Other metadata is absent.
-- Shared staff reminder stays in the frontend. Dates in reference titles are NOT verification dates.
-- Rerunning inserts missing rows only; it never overwrites subsequent admin edits.
begin;

insert into public.state_rules
  (state_code, state_name, special_instruction, staff_note, source_url, last_verified, active, instruction_overrides)
values
  ('TX', 'Texas', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('AL', 'Alabama', 'Accepts the HOT ID as a primary ID, include HOT ID cover letter, SASE', NULL, NULL, NULL, true, '{}'::jsonb),
  ('AK', 'Alaska', 'Accepts the HOT ID as a primary ID, include HOT ID cover letter', NULL, NULL, NULL, true, '{}'::jsonb),
  ('AZ', 'Arizona', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('AR', 'Arkansas', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('CA', 'California', 'Apply to the City or County. The state is taking 3 months to return BCs. Be careful with Los Angeles – go to https://www.lavote.gov/ and choose the Recorder option.', NULL, 'https://www.lavote.gov/', NULL, true, '{}'::jsonb),
  ('CO', 'Colorado', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('CT', 'Connecticut', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('DE', 'Delaware', 'Use custom cover letter in Blue Folder', NULL, NULL, NULL, true, '{}'::jsonb),
  ('DC', 'District of Columbia', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('FL', 'Florida', 'No cover letter needed – only the application. Accepts HOT ID.', NULL, NULL, NULL, true, '{}'::jsonb),
  ('GA', 'Georgia', 'Accepts HOT ID as a primary ID, include HOT ID cover letter', NULL, NULL, NULL, true, '{}'::jsonb),
  ('HI', 'Hawaii', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('ID', 'Idaho', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('IL', 'Illinois', 'Apply to city or county, not the state – processing time too long', NULL, NULL, NULL, true, '{"cook_county":"HOT ID accepted as a primary ID. Include HOT ID cover letter. Requires a SASE"}'::jsonb),
  ('IN', 'Indiana', 'Apply to city or county, not the state – processing time too long', NULL, NULL, NULL, true, '{}'::jsonb),
  ('IA', 'Iowa', 'HOT ID accepted. Application must be notarized. Include client’s name in notary section. SASE', NULL, NULL, NULL, true, '{}'::jsonb),
  ('KS', 'Kansas', 'HOT ID accepted. Include HOT ID cover letter. SASE', NULL, NULL, NULL, true, '{}'::jsonb),
  ('KY', 'Kentucky', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('LA', 'Louisiana', 'Accepts the HOT ID as a secondary ID, include HOT ID cover letter', NULL, NULL, NULL, true, '{}'::jsonb),
  ('ME', 'Maine', 'OPID cover letter needs to be notarized', NULL, NULL, NULL, true, '{}'::jsonb),
  ('MD', 'Maryland', 'Use custom cover letter, in Blue Folder, SASE
Accepts the HOT ID as a secondary ID, include HOT ID cover letter, SASE', NULL, NULL, NULL, true, '{}'::jsonb),
  ('MA', 'Massachusetts', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('MI', 'Michigan', 'CLIENT with NO DOCUMENTS – after verifying that they have no required documents from the list on the web site, call county clerk where client was born to see what they will accept in case they will accept the HOT ID or a notarized application, for example.
Genesee County – accepts the HOT ID as a primary
Wayne County accepts our business check.', NULL, NULL, NULL, true, '{}'::jsonb),
  ('MN', 'Minnesota', 'Birth certificate application must be notarized.', NULL, NULL, NULL, true, '{}'::jsonb),
  ('MS', 'Mississippi', 'Accepts HOT ID as a primary ID, include HOT ID cover letter', NULL, NULL, NULL, true, '{}'::jsonb),
  ('MO', 'Missouri', 'Apply to the city or county, not the state- processing time too long. For St. Louis, application must contain client’s signature and must be notarized. SASE', NULL, NULL, NULL, true, '{}'::jsonb),
  ('MT', 'Montana', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('NE', 'Nebraska', 'Accepts HOT ID as a primary ID, include HOT ID cover letter', NULL, NULL, NULL, true, '{}'::jsonb),
  ('NV', 'Nevada', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('NH', 'New Hampshire', 'Use “Assignment of Access” form since OPID is the requestor. SASE', NULL, NULL, NULL, true, '{}'::jsonb),
  ('NJ', 'New Jersey', 'Use the custom New Jersey cover letter in the Blue Folder. Obtain REG-2 Delegation of Authority and the current REG-27 application from New Jersey Vital Statistics. Confirm the current authorized OPID representative before completing the requestor and delegation fields. Use the OPID mailing address, email, and phone. The supplied guide names Esmeralda Reyes; verify that assignment with staff.', NULL, 'https://www.nj.gov/health/vital/order-vital/forms-public/', NULL, true, '{}'::jsonb),
  ('NM', 'New Mexico', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('NY', 'New York', 'Apply to the city or county', NULL, NULL, NULL, true, '{"nyc":"See page in the Reference Guide for instructions"}'::jsonb),
  ('NC', 'North Carolina', 'Do not apply to the state. Apply to city or county for a shorter processing time.
Cumberland County- Include OPID’s Authorization to Release form and include a SASE', NULL, NULL, NULL, true, '{}'::jsonb),
  ('ND', 'North Dakota', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('OH', 'Ohio', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('OK', 'Oklahoma', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('OR', 'Oregon', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('PA', 'Pennsylvania', 'Use the custom Pennsylvania cover letter, in the Blue Folder.
In Applicant Signature section - have client sign then have Esmeralda sign below the client’s signature.', NULL, NULL, NULL, true, '{}'::jsonb),
  ('RI', 'Rhode Island', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('SC', 'South Carolina', 'Accepts HOT ID as a primary ID, include HOT ID cover letter', NULL, NULL, NULL, true, '{}'::jsonb),
  ('SD', 'South Dakota', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('TN', 'Tennessee', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('UT', 'Utah', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('VT', 'Vermont', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('VA', 'Virginia', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('WA', 'Washington', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('WV', 'West Virginia', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('WI', 'Wisconsin', 'Accepts HOT ID. Include HOT ID cover letter. SASE required', NULL, NULL, NULL, true, '{}'::jsonb),
  ('WY', 'Wyoming', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('AS', 'American Samoa', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('GU', 'Guam', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('MP', 'Northern Mariana Islands', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('PR', 'Puerto Rico', NULL, NULL, NULL, NULL, true, '{}'::jsonb),
  ('VI', 'U.S. Virgin Islands', NULL, NULL, NULL, NULL, true, '{}'::jsonb)
on conflict (state_code) do nothing;

commit;

