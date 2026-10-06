import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";


/**
 * Parámetros públicos soportados por GET /api/v1/journeys.
 *
 * Aquí validamos estructura y tipos.
 * Las reglas que relacionan varios campos (from <= to,
 * máximo 31 días, cursor dentro del rango) pertenecen al Service.
 */

export class GetJourneysDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "from debe tener formato YYYY-MM-DD",
  })
  from!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "to debe tener formato YYYY-MM-DD",
  })
  to!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: "limit debe ser un número entero",
  })
  @Min(1, {
    message: "limit debe ser mayor o igual a 1",
  })
  @Max(1000, {
    message: "limit no puede superar 1000",
  })
  limit: number = 500;

  @IsOptional()
  @IsString()
  @MaxLength(512, {
    message: "cursor excede la longitud permitida",
  })
  cursor?: string;
}