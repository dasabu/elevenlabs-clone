import { serve } from "inngest/next";
import { inngest } from "~/inngest/client";
import { aiGenerationFunction } from "~/inngest/function";

// Create an API that serves zero function
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [aiGenerationFunction]
})