import Router from "@koa/router"
import Joi from "joi"
import * as controller from "../controllers/ai"
import { auth, permissions } from "@budibase/backend-core"
import authorized from "../../middleware/authorized"

const router: Router = new Router()

const MODELS = ["ChatGPT", "GPT4All", "TogetherAI", "LlamaCPP"]

function aiPromptValidator() {
  return auth.joiValidator.body(
    Joi.object({
      prompt: Joi.string().required(),
      // TODO: fix these models here and use an enum
      model: Joi.string().required().valid(...MODELS),
    }).unknown(false)
  )
}

function sqlPromptValidator() {
  return auth.joiValidator.body(
    Joi.object({
      prompt: Joi.string().required(),
      datasourceId: Joi.string().required(),
      tableName: Joi.string().required(),
      model: Joi.string().required().valid(...MODELS),
    }).unknown(false)
  )
}

router
  .post(
    "/api/ai/prompt",
    // authorized(permissions.BUILDER),
    aiPromptValidator(),
    controller.prompt
  )
  .post(
    "/api/ai/summarizetext",
    // authorized(permissions.BUILDER),
    aiPromptValidator(),
    controller.summariseText
  )
  .post(
    "/api/ai/generate/sql",
    // authorized(permissions.BUILDER),
    sqlPromptValidator(),
    controller.generateSQL
  )
  .post(
    "/api/ai/generate/js",
    // authorized(permissions.BUILDER),
    aiPromptValidator(),
    controller.generateJS
  )
  .post(
    "/api/ai/generate/table",
    // authorized(permissions.BUILDER),
    aiPromptValidator(),
    controller.generateBudibaseTableSchema
  )
  .post(
    "/api/ai/generate/screen",
    // authorized(permissions.BUILDER),
    aiPromptValidator(),
    controller.generateBudibaseScreen
  )

export default router
