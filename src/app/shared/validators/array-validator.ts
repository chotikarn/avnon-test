import { AbstractControl, FormArray, ValidatorFn } from '@angular/forms';

export class ChoiceArrayValidators {

  // max length
  public static maxSelectLength(max: number): ValidatorFn | any {
    return (control: AbstractControl[]) => {
      if (!(control instanceof FormArray)) return;
      const selected = control.controls.filter(item => item.value.select);
      return selected.length > max ? { maxSelectLength: true } : null;
    }
  }

  // min length
  public static minSelectLength(min: number): ValidatorFn | any {
    return (control: AbstractControl[]) => {
      if (!(control instanceof FormArray)) return;
      const selected = control.controls.filter(item => item.value.select);
      return selected.length < min ? { minSelectLength: true } : null;
    }
  }
}
