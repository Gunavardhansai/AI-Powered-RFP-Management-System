// placeholder if you want to store AI prompt templates; used when USE_OPENAI=true
module.exports = {
  rfpPrompt: (text) => `Convert the following procurement request to a JSON RFP:\n\n${text}\n\nReturn only valid JSON.`,
  vendorParsePrompt: (text) => `Parse this vendor reply into JSON proposal structure:\n\n${text}\n\nReturn only valid JSON.`
};

