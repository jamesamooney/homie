export interface OfferTemplateInput {
  buyerName: string;
  propertyAddress: string;
  amount: string;
  agentName: string;
  agentEmail?: string;
  notes?: string;
}

/** Generates a ready-to-send offer email. Buyer copies this into their own client — never sent by the app. */
export function generateOfferEmail(input: OfferTemplateInput): string {
  const { buyerName, propertyAddress, amount, agentName, agentEmail, notes } = input;
  const greeting = agentName ? `Dear ${agentName},` : "Dear Sir/Madam,";
  const notesParagraph = notes?.trim()
    ? `\n\n${notes.trim()}`
    : "";

  return [
    `Subject: Offer for ${propertyAddress}`,
    "",
    agentEmail ? `To: ${agentEmail}` : undefined,
    "",
    greeting,
    "",
    `I am writing to formally submit an offer for ${propertyAddress}.`,
    "",
    `I would like to offer £${amount} for the property. I am a motivated buyer and am keen to proceed promptly if this offer is accepted.${notesParagraph}`,
    "",
    "Please let me know if you require any further information from me, or if you would like to discuss this offer in more detail.",
    "",
    "I look forward to hearing from you.",
    "",
    "Kind regards,",
    buyerName || "[Your name]",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}
