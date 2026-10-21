// A "type" describes the shape of a piece of data. TypeScript uses it to
// warn us early if we, say, forget the recipient or misspell a field name.
export type ScheduledMessage = {
  id: string; // a unique label so React can tell list items apart
  recipient: string; // phone number in international format, e.g. +919876543210
  text: string;
  sendAt: Date; // when the message should go out
};
