import { Injectable } from '@angular/core';
import {
  CheckBoxConfig,
  ParagraphConfig,
  QuestionConfig,
  QuestionType
} from '../components/question-picker/constrants/types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  // Make it private to avoid directly push any data type to subject, instead push new data via exposed add method.
  private questions: BehaviorSubject<QuestionConfig[]> = new BehaviorSubject<QuestionConfig[]>([]);
  // Expose subject's observable only, for other component to consume.
  public questions$ = this.questions.asObservable();

  /**
   * Access current question with getter.
   */
  get currentQuestion(): QuestionConfig[] {
    return this.questions.value;
  }

  /**
   * Append new added question to questions state.
   * @param type
   * @param config
   */
  public add(type: QuestionType, config: ParagraphConfig | CheckBoxConfig) {
    // TODO: add temporary uuid foreach question for better track on list rendering.
    const newQuestionList = [...this.currentQuestion, { type, config }];
    this.questions.next(newQuestionList);
  }
}
