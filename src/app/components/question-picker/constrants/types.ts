export enum QuestionType {
  Paragraph = 'Paragraph',
  CheckBoxes = 'Checkboxes'
}

export interface ParagraphConfig {
  question: string;
  required: boolean;
}

export interface CheckBoxConfig extends ParagraphConfig{
  choices: string[];
  allowOther: boolean;
}

export interface QuestionConfig {
  type: QuestionType,
  config: ParagraphConfig | CheckBoxConfig
}
