UPDATE patterns 
SET uv_matriz_id = (SELECT id FROM uv_matrices LIMIT 1)
WHERE uv_matriz_id IS NULL;