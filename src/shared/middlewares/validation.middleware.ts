import { plainToInstance } from "class-transformer";
import {
  validate,
  ValidationError,
} from "class-validator";
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

import { BadRequestException } from "../exceptions/http.exception";



/**
 * Valida body/query/params contra un DTO.
 *
 * IMPORTANTE:
 * En Express 5 evitamos reemplazar directamente req.query, ya que
 * esta propiedad se comporta como getter. El DTO validado se almacena
 * en res.locals para que posteriormente el controller lo consuma.
 */

export const validateDto = (
  type: new () => object,
  property: "body" | "query" | "params" = "body",
): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dtoObject = plainToInstance(
        type,
        req[property],
      );

      const errors: ValidationError[] = await validate(
        dtoObject,
        {
          whitelist: true,
          forbidNonWhitelisted: true,
        },
      );
      if (errors.length > 0) {
        const dtoErrors = errors
          .flatMap((error) =>
            Object.values(error.constraints ?? {}),
          )
          .join("; ");

        next(
          new BadRequestException(
            dtoErrors || "Parámetros inválidos",
          ),
        );

        return;
      }

      /**
       * En Express 5 no sobrescribimos req.query.
       *
       * Guardamos explícitamente el DTO validado en res.locals.
       * Esto evita depender del getter interno de req.query y deja
       * disponible una representación segura para el controller.
       */
      if (property === "query") {
        res.locals.validatedQuery = dtoObject;
      } else if (property === "body") {
        res.locals.validatedBody = dtoObject;
      } else {
        res.locals.validatedParams = dtoObject;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};