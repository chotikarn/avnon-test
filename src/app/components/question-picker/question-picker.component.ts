import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckBoxConfig, ParagraphConfig, QuestionType } from './constrants/types';
import {
  FormArray,
  FormBuilder,
  FormControl, FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { map, tap } from 'rxjs';

import { QuestionService } from '../../services/question.service';
import { COMPONENT_OVERLAY_REF } from '../../shared/tokens';

interface QuestionForm {
  type: FormControl<QuestionType | string | null>;
  required: FormControl<boolean | null>;
  question: FormControl<string | null>;
  choices?: FormArray<FormControl<string | null>>;
  allowOther?: FormControl<boolean | null>;
}

@Component({
  selector: 'app-question-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './question-picker.component.html',
  styleUrl: './question-picker.component.css',
})
export class QuestionPickerComponent implements OnInit {
  private readonly questionService = inject(QuestionService);
  public questionForm: FormGroup<QuestionForm> = this.fb.group<QuestionForm>({
    type: this.fb.control<QuestionType | string | null>('', [Validators.required]),
    required: this.fb.control(false, [Validators.required]),
    question: this.fb.control('', [Validators.required]),
  });
  public questionTypeList = [
    {
      type: QuestionType.Paragraph,
      label: 'Paragraph'
    },
    {
      type: QuestionType.CheckBoxes,
      label: 'CheckBox'
    },
  ];
  public questionType = this.questionForm
    .valueChanges.pipe(map(value => value.type));

  constructor(
    @Inject(COMPONENT_OVERLAY_REF) private overlayRef: OverlayRef,
    private readonly fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.questionType.pipe(
      tap((type) => this.updateConfigForm(type))
    ).subscribe();
  }

  get choices(): FormArray | null {
    return this.questionForm.get('choices') as FormArray | null;
  }

  /**
   * Update preview form with configuration got changed.
   * @param type
   */
  private updateConfigForm(type: QuestionType | string | null | undefined) {
    switch (type) {
      case QuestionType.CheckBoxes:
        return this.addChoicesControl();
      default: this.removeChoiceControl();
    }
  }

  /**
   * When question type set to `Checkboxes` type by user
   * then add `choices` and `allowOther` to form group.
   */
  private addChoicesControl() {
    if (this.choices) {
      return;
    }
    this.questionForm.addControl(
      'choices',
      this.fb.array([
        new FormControl<string|null>('', [Validators.required]),
        new FormControl<string|null>('', [Validators.required])
      ]));
    this.questionForm.addControl('allowOther', this.fb.control(false, [Validators.required]));
  }

  /**
   * When question type not `Checkboxes` type by user switch type,
   * and `choices` control exist then remove `choices` and `allowOther` from form group.
   */
  private removeChoiceControl() {
    if (!this.choices) {
      return;
    }
    this.questionForm.removeControl('choices');
    this.questionForm.removeControl('allowOther');
  }

  /**
   * Handle add answer choice to `Checkboxes` type.
   */
  addAnswer() {
    if (!this.choices) {
      return;
    }
    this.choices?.push(new FormControl<string|null>('', [Validators.required]));
  }

  /**
   * Handle remove choices in `Checkboxes` type.
   * @param index
   */
  removeAnswer(index: number) {
    if (!this.choices) {
      return;
    }
    this.choices.removeAt(index);
  }

  /**
   * Add question config to question builder service.
   */
  addQuestionConfig() {
    const { type, ...config } = this.questionForm.value;
    this.questionService.add(type as QuestionType, config as ParagraphConfig | CheckBoxConfig);
    this.close();
  }

  /**
   * Close popover.
   */
  close() {
    this.overlayRef.detach();
  }
}
