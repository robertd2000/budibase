// import { LlamaModel, LlamaContext, LlamaChatSession } from "node-llama-cpp"
import { ILargeLanguageModel } from "./";
import environment from "../../environment"
import { TableSchema, Screen } from "@budibase/types";
import * as Prompts from "../prompts"

export class LlamaCPP implements ILargeLanguageModel {
  private client: any

  constructor() {
  }

  async chatCompletion(prompt: string) {
    const {LlamaModel, LlamaContext, LlamaChatSession} = await import("node-llama-cpp")
    const model = new LlamaModel({
      // @ts-ignore
      modelPath: environment.LLAMA_CPP_MODEL_PATH,
    })
    const context = new LlamaContext({ model })
    this.client = new LlamaChatSession({ context })
    try {
      return this.client.prompt(prompt)
    } catch (err) {
      console.error(err)
    }
  }

  async prompt(prompt: string): Promise<string | undefined> {
    // TODO: validate prompt in some way
    return this.chatCompletion(prompt)
  }

  async summarizeText(prompt: string): Promise<string | undefined> {
    const summarizePrompt = `Summarize this text:\n${prompt}`
    return this.chatCompletion(summarizePrompt)
  }

  async generateCode(prompt: string): Promise<string | undefined> {
    const completion = await this.chatCompletion(Prompts.generateCode(prompt))
    return completion
  }

  async generateSQL(prompt: string, tableSchema: string, dialect: any): Promise<string | undefined> {
    const completion = await this.chatCompletion(Prompts.generateSQL(prompt, tableSchema))
    return completion
  }

  async generateBudibaseTableSchema(prompt: string): Promise<TableSchema> {
    try {
      const completion = await this.chatCompletion(Prompts.generateBudibaseTable(prompt))
      console.log(completion)
      return <TableSchema>JSON.parse(completion!)
    } catch (err) {
      console.error("Error generating budibase schema", err)
      return <TableSchema>{}
    }
  }


  async generateBudibaseScreen(prompt: string): Promise<Screen> {
    try {
      const completion = await this.chatCompletion(Prompts.generateForm(prompt))
      return <Screen>JSON.parse(completion!)
    } catch (err) {
      console.error("Error generating budibase screen", err)
      return <Screen>{}
    }
  }
}


