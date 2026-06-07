-- Adicionar tipo padrão 'outro' para zonas existentes sem tipo
UPDATE uv_matrices
SET zones = (
  SELECT jsonb_agg(
    CASE 
      WHEN zone->>'tipo' IS NULL 
      THEN zone || '{"tipo": "outro"}'::jsonb
      ELSE zone
    END
  )
  FROM jsonb_array_elements(zones) AS zone
)
WHERE jsonb_array_length(zones) > 0;