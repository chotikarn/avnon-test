import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Injector } from '@angular/core';
import {
  FormArray,
  FormBuilder, FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { FullscreenOverlayContainer, Overlay, OverlayContainer, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { tap } from 'rxjs';

import { QuestionPickerComponent } from '../../components/question-picker/question-picker.component';
import { QuestionService } from '../../services/question.service';
import {
  CheckBoxConfig,
  ParagraphConfig,
  QuestionConfig,
  QuestionType
} from '../../components/question-picker/constrants/types';
import { COMPONENT_OVERLAY_REF } from '../../shared/tokens';
import { ChoiceArrayValidators } from '../../shared/validators/array-validator';
import { Router } from '@angular/router';

interface CheckboxForm {
  type: FormControl<string | null>;
  question: FormControl<string | null>;
  choices: FormArray<FormGroup<ChoiceForm>>;
  other?: FormControl<string | null>;
}

interface ParagraphForm {
  type: FormControl<string | null>;
  question: FormControl<string | null>;
  answer: FormControl<string | null>;
}

interface ChoiceForm {
  value: FormControl<string | null>;
  select: FormControl<boolean | null>;
}

interface QuestionsForm {
  questions: FormArray;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, OverlayModule, FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [{provide: OverlayContainer, useClass: FullscreenOverlayContainer}],
})
export class HomeComponent {
  private readonly overlayRef!: OverlayRef;
  private readonly questionService = inject(QuestionService);
  private readonly destroyRef = inject(DestroyRef);
  public questions$ = this.questionService.questions$;
  public questionsForm = this.fb.group<QuestionsForm>({
    questions: this.fb.array<FormGroup>([])
  });

  constructor(
    private readonly overlay: Overlay,
    private readonly fb: FormBuilder,
    private readonly router: Router,
  ) {
    this.overlayRef = this.overlay.create({
      panelClass: ['app-dialog-container'],
      hasBackdrop: true,
    });
    // Subscribe to question configuration changes.
    const questionSubscription = this.questions$.pipe(
      tap(questions => this.updateQuestionsForm(questions))
    ).subscribe();
    // Unsubscribe.
    this.destroyRef.onDestroy(() => {
      questionSubscription.unsubscribe();
    });
  }

  /**
   * Getter for questions' FormArray
   */
  get questions(): FormArray | null {
    return this.questionsForm.get('questions') as FormArray | null;
  }

  /**
   * Update preview form.
   * @param questions
   * @private
   */
  private updateQuestionsForm(questions: QuestionConfig[]) {
    // Save current form's values.
    const currentValue = this.questionsForm.value;
    // Reset the form.
    this.questionsForm.reset();
    // Clear questions FormArray.
    this.questions?.clear();
    // Render each question on form.
    for (const { type, config } of questions) {
      this.addQuestionType(type, config);
    }
    // Patch saved value back.
    this.questionsForm.patchValue(currentValue, { emitEvent: true });
  }

  /**
   * Add question group to questions FormArray according to given type and config.
   * @param type
   * @param config
   * @private
   */
  private addQuestionType(type: QuestionType, config: ParagraphConfig | CheckBoxConfig) {
    if (!this.questions) return;
    switch (type) {
      case QuestionType.CheckBoxes:
        this.questions.push(this.getCheckboxFormGroup(config as CheckBoxConfig));
        break;
      default:
        this.questions.push(this.getParagraphFormGroup(config));
    }
  }

  /**
   * Create paragraph type form group
   * @param config
   * @private
   */
  private getParagraphFormGroup(config: ParagraphConfig) {
    const questionGroup = this.fb.group<ParagraphForm>({
      type: this.fb.control('textarea'),
      question: this.fb.control(config.question),
      answer: this.fb.control('')
    });
    if (config.required) {
      questionGroup.get('answer')?.addValidators([Validators.required]);
    }
    return questionGroup;
  }

  /**
   * Create checkboxes type form group
   * @param config
   * @private
   */
  private getCheckboxFormGroup(config: CheckBoxConfig) {
    const questionGroup = this.fb.group<CheckboxForm>({
      type: this.fb.control('checkbox'),
      question: this.fb.control(config.question),
      choices: this.fb.array<FormGroup<ChoiceForm>>([])
    });
    const { choices } = config;
    const answerArray = questionGroup.get('choices') as FormArray;
    for (const choice of choices) {
      answerArray.push(this.fb.group({ value: choice, select: false }));
    }
    if (config.allowOther) {
      answerArray.push(this.fb.group({ value: 'Other', select: false }));
      questionGroup.addControl('other', this.fb.control(''));
    }
    if (config.required) {
      answerArray.addValidators([ChoiceArrayValidators.minSelectLength(1)]);
    }
    return questionGroup;
  }

  /**
   * Locate choices form control from given question's form control.
   * @param control
   */
  getQuestionChoices(control: unknown): FormArray<FormGroup<ChoiceForm>> {
    return (control as FormGroup).get('choices') as FormArray;
  }

  /**
   * Handle on user click add question button.
   */
  addQuestion() {
    const injector = Injector.create({
      providers: [{ provide: COMPONENT_OVERLAY_REF, useValue: this.overlayRef }],
    });
    const questionPickerPortal = new ComponentPortal(QuestionPickerComponent, undefined, injector);
    this.overlayRef.attach(questionPickerPortal);
  }

  /**
   * Handle submit form for review.
   */
  async submit() {
    const formData = this.questionsForm.value;
    if (this.questionsForm.invalid) {
      // TODO: add form valid/invalid state.
      // TODO: add alert dialog instead or using browser alert.
      alert('Please complete form');
      return;
    }
    // This result can be also centralize in service, but to show another usage of route's extras info.
    // Ref: https://angular.io/api/router/NavigationBehaviorOptions#info
    await this.router.navigate(['/', 'review'], { info: formData });
  }
}
