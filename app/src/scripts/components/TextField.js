/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Class constructor for Textfield MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 * @param {HTMLElement} element The element that will be upgraded.
 */
export default class MaterialTextfield {

  constructor (element) {
    this.element_ = element;
    this.maxRows = this.Constant_.NO_MAX_ROWS;
    // Initialize instance.
    this.init();
  }

  /**
   * Store constants in one place so they can be updated easily.
   * @enum {string | number}
   * @private
   */
  get Constant_ () {
    return {
      NO_MAX_ROWS: -1,
      MAX_ROWS_ATTRIBUTE: 'maxrows'
    };
  }

  /**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   * @enum {string}
   * @private
   */
  get CssClasses_ () {
    return {
      LABEL: 'mdl-textfield__label',
      INPUT: 'mdl-textfield__input',
      IS_DIRTY: 'is-dirty',
      IS_FOCUSED: 'is-focused',
      IS_DISABLED: 'is-disabled',
      IS_INVALID: 'is-invalid',
      IS_UPGRADED: 'is-upgraded'
    };
  }

  /**
   * Handle input being entered.
   * @param {Event} event The event that fired.
   * @private
   */
  onKeyDown_ (event) {

    var currentRowCount = event.target.value.split('\n').length;
    if (event.keyCode === 13) {
      if (currentRowCount >= this.maxRows) {
        event.preventDefault();
      }
    }
  }

  /**
   * Handle focus.
   * @param {Event} event The event that fired.
   * @private
   */
  onFocus_ (event) {

    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
  }

  /**
   * Handle lost focus.
   * @param {Event} event The event that fired.
   * @private
   */
  onBlur_ (event) {

    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
  }

  /**
   * Handle class updates.
   * @param {HTMLElement} button The button whose classes we should update.
   * @param {HTMLElement} label The label whose classes we should update.
   * @private
   */
  updateClasses_ () {
    this.checkDisabled();
    this.checkValidity();
    this.checkDirty();
  }

  // Public methods.

  /**
   * Check the disabled state and update field accordingly.
   * @public
   */
  checkDisabled () {
    if (this.input_.disabled) {
      this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
  }

  /**
   * Check the validity state and update field accordingly.
   * @public
   */
  checkValidity () {
    if (this.input_.validity.valid) {
      this.element_.classList.remove(this.CssClasses_.IS_INVALID);
    } else {
      this.element_.classList.add(this.CssClasses_.IS_INVALID);
    }
  }

  /**
  * Check the dirty state and update field accordingly.
  * @public
  */
  checkDirty () {
    if (this.input_.value && this.input_.value.length > 0) {
      this.element_.classList.add(this.CssClasses_.IS_DIRTY);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_DIRTY);
    }
  }

  /**
   * Disable text field.
   * @public
   */
  disable () {

    this.input_.disabled = true;
    this.updateClasses_();
  }

  /**
   * Enable text field.
   * @public
   */
  enable () {

    this.input_.disabled = false;
    this.updateClasses_();
  }

  /**
   * Update text field value.
   * @param {String} value The value to which to set the control (optional).
   * @public
   */
  change (value) {

    if (value) {
      this.input_.value = value;
    }
    this.updateClasses_();
  }

  /**
   * Initialize element.
   */
  init () {

    if (this.element_) {
      this.label_ = this.element_.querySelector('.' + this.CssClasses_.LABEL);
      this.input_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);

      if (this.input_) {
        if (this.input_.hasAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE)) {
          this.maxRows = parseInt(this.input_.getAttribute(
              this.Constant_.MAX_ROWS_ATTRIBUTE), 10);
          if (isNaN(this.maxRows)) {
            this.maxRows = this.Constant_.NO_MAX_ROWS;
          }
        }

        this.boundUpdateClassesHandler = this.updateClasses_.bind(this);
        this.boundFocusHandler = this.onFocus_.bind(this);
        this.boundBlurHandler = this.onBlur_.bind(this);
        this.input_.addEventListener('input', this.boundUpdateClassesHandler);
        this.input_.addEventListener('focus', this.boundFocusHandler);
        this.input_.addEventListener('blur', this.boundBlurHandler);

        if (this.maxRows !== this.Constant_.NO_MAX_ROWS) {
          // TODO: This should handle pasting multi line text.
          // Currently doesn't.
          this.boundKeyDownHandler = this.onKeyDown_.bind(this);
          this.input_.addEventListener('keydown', this.boundKeyDownHandler);
        }

        this.updateClasses_();
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
      }
    }
  }

  /**
   * Downgrade the component
   */
  mdlDowngrade_ () {
    this.input_.removeEventListener('input', this.boundUpdateClassesHandler);
    this.input_.removeEventListener('focus', this.boundFocusHandler);
    this.input_.removeEventListener('blur', this.boundBlurHandler);
    if (this.boundKeyDownHandler) {
      this.input_.removeEventListener('keydown', this.boundKeyDownHandler);
    }
  }
}

var textfields = document.querySelectorAll('.mdl-js-textfield');
for (var t = 0; t < textfields.length; t++) {
  new MaterialTextfield(textfields[t]);
}
