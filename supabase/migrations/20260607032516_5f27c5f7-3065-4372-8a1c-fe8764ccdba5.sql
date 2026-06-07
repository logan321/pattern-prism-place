-- Função para converter as zonas de um JSONB
CREATE OR REPLACE FUNCTION migrate_zones(zones_json JSONB) 
RETURNS JSONB AS $$
DECLARE
    zone_record RECORD;
    new_zones JSONB := '[]'::JSONB;
BEGIN
    IF zones_json IS NULL OR jsonb_array_length(zones_json) = 0 THEN
        RETURN zones_json;
    END IF;

    FOR zone_record IN SELECT * FROM jsonb_array_elements(zones_json)
    LOOP
        -- Se já tem uvCenter, assume que já foi migrado
        IF zone_record.value ? 'uvCenter' THEN
            new_zones := new_zones || zone_record.value;
        ELSE
            -- Cria a nova estrutura baseada na antiga
            new_zones := new_zones || jsonb_build_object(
                'id', zone_record.value->>'id',
                'name', zone_record.value->>'name',
                'type', COALESCE(zone_record.value->>'type', 'text'),
                'uvCenter', zone_record.value->'uv',
                'width', 0.10,
                'height', 0.10,
                'rotation', 0,
                'point', zone_record.value->'point',
                'normal', zone_record.value->'normal'
            );
        END IF;
    END LOOP;
    
    RETURN new_zones;
END;
$$ LANGUAGE plpgsql;

-- Aplica a migração na tabela uv_matrices
UPDATE uv_matrices SET zones = migrate_zones(zones);

-- Remove a função temporária
DROP FUNCTION migrate_zones(JSONB);