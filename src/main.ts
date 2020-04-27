/**
 * TagWhirl is a Web Component which uses CSS animations, variables and Shadow DOM with slots
 * to display a tag list with the whirl effect.
 *
 * Animation visualization may be customized by setting custom attributes.
 * Available CSS variables:
 * --link-color
 * --link-hover-color
 * --link-hover-background
 *
 * Template is included in file. HTML syntax can be highlighted in VScode
 * with 'es6-string-html' extension.
 */

/**
 * List of all constants for classes, ids and selectors for template and code.
 */
const ulClassName = "listContainer";
const ulSelector = `.${ulClassName}`;
const titleClassName = "title";
const titleSelector = `.${titleClassName}`;
const liClassName = "listItem";
const liSelector = `.${liClassName}`;
const liTemplateId = "listItemId";
const liTemplateSelector = `#${liTemplateId}`;
const linkClassName = "listItemLink";
const linkSelector = `.${linkClassName}`;
const animationStyleId = "generatedAnimation";
const animationStyleSelector = "#generatedAnimation";
const titleSlotName = "title";

/**
 * Template for {@link TagWhirl} custom element.
 *
 * @remarks
 * Part of stylesheet is generated at runtime in style tag with selector {@link animationStyleSelector}
 */
const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    :host {
      display: flex;
      position: relative;
      padding: 0 !important;
    }
    .${titleClassName} {
      font-weight: normal;
      position: absolute;
      left: 50%;
      top: 50%;
      text-align: center;
      font-size: 1.5rem;
      line-height: 1.5rem;
      margin: 0;
    }
    .${titleClassName} slot {
      display: block;
      transform: translateX(-50%) translateY(-50%);
    }
    .${ulClassName} {
      position: relative;
      margin: auto;
      padding: 0;
      width: 0;
      height: 0;
      overflow: visible;
    }
    .${liClassName} {
      position: absolute;
      white-space: nowrap;
      opacity: 0;
      z-index: 10;
      visibility: hidden;
    }
    .${linkClassName} {
      position: relative;
      color: var(--link-color);
      text-decoratio: none;
      display: block;
      transform: translateX(-50%) translateY(-50%);
      padding: 0.2em;
      visibility: visible;
    }
    .${ulClassName}:hover > .${liClassName} {
      animation-play-state: paused !important;
    }
    .${liClassName}:hover {
      z-index: 20;
    }
    .${linkClassName}:hover {
      cursor: pointer;
      color: var(--link-hover-color);
      background: var(--link-hover-background);
      font-size: 1.5em;
    }
  </style>
  <style id="${animationStyleId}"></style>
  <h1 class="${titleClassName}">
    <slot name="${titleSlotName}"></slot>
  </h1>
  <ul class="${ulClassName}"></ul>
  <template id="${liTemplateId}">
    <li class="${liClassName}"><a class="${linkClassName}"></a></li>
  </template>
`;

/**
 * This interface describes single tag item.
 */
export interface TagOption {
  /**
   * This text is used to display tag.
   */
  text: string;
  /**
   * Link is optional.
   */
  href?: string;
}

/**
 * Each tag item has it's own animation config.
 * @internal
 */
interface AnimationConfig {
  fontSizeEm: number;
  secForTurn: number;
  rotationOffset: number;
  translateX: number;
}

/**
 * The main class for tag whirl custom element.
 */
export class TagWhirl extends HTMLElement {
  /**
   * Define how much turns whirl should have.
   */
  public turns: number = 3;

  /**
   * How long it takes a tag to make a turn.
   */
  public secForTurn: number = 50;

  /**
   * Font size minimal value.
   */
  public fontSizeMinEm: number = 0.7;

  /**
   * Font size reduce ratio.
   */
  public fontSizeRatio: number = 1.5;

  /**
   * Main property, it accepts TagOptions to build tag whirl.
   */
  public set items(value: TagOption[]) {
    this.setItems(value);
  }
  public get items(): TagOption[] {
    return this.currentItems;
  }

  /**
   * Contain ordered list of tags.
   */
  private currentItems: TagOption[] = [];

  /**
   * Shadow DOM root element.
   */
  private get rootEl(): ShadowRoot {
    return this.shadowRoot || this.attachShadow({ mode: "open" });
  }

  /**
   * Minium container size is calculated in {@link TagWhirl.updateSize}.
   */
  private minSizePx: number = 0;

  /**
   * Title size is calculated in {@link TagWhirl.updateTitle}.
   */
  private titleSizePx: number = 0;

  /**
   * Part of custom element specification, required for {@link TagWhirl.attributeChangedCallback}.
   *
   * sec-for-turn - {@link TagWhirl.secForTurn}
   * font-size-min-em - {@link TagWhirl.fontSizeMinEm}
   * font-size-ratio - {@link TagWhirl.fontSizeRatio}
   */
  static get observedAttributes(): string[] {
    return ["turns", "sec-for-turn", "font-size-min-em", "font-size-ratio"];
  }

  /**
   * Part of custom element specification.
   *
   * @param name one of observed attributes
   * @param oldValue
   * @param newValue
   */
  public attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (oldValue === newValue) {
      return;
    }

    switch (name) {
      case "turns":
        this.turns = +newValue;
        this.updateStyleSheet();
        break;
      case "sec-for-turn":
        this.secForTurn = +newValue;
        this.updateStyleSheet();
        break;
      case "font-size-min-em":
        this.fontSizeMinEm = +newValue;
        this.updateStyleSheet();
        break;
      case "font-size-ratio":
        this.fontSizeMinEm = +newValue;
        this.updateStyleSheet();
        break;
      default:
        break;
    }
  }

  /**
   * Part of custom element specification.
   */
  public connectedCallback(): void {
    this.rootEl.appendChild(template.content.cloneNode(true));

    this.updateTitle();
    this.updateSize();
  }

  /**
   * Set all tags
   *
   * @param value tag options
   */
  private setItems(value: TagOption[]): void {
    this.currentItems = this.normalizeValue(value);
    this.updateDomNodes();
    this.updateStyleSheet();
  }

  /**
   * Update custom element minimal size. Animation styles are not recalculated.
   */
  private updateSize(): void {
    this.minSizePx = Math.min(this.offsetHeight, this.offsetWidth);
  }

  /**
   * Update title size. Animation styles are not recalculated.
   */
  private updateTitle(): void {
    const titleEL = this.rootEl.querySelector(titleSelector) as HTMLElement;

    this.titleSizePx = Math.max(titleEL?.clientHeight, titleEL.clientWidth);
  }

  /**
   * Prepare tag options for rendering. Sort tags by text length.
   */
  private normalizeValue(value: TagOption[]): TagOption[] {
    return value.sort((a, b) =>
      !!a && !!b ? a.text.length - b.text.length : 0
    );
  }

  /**
   * Clear tag list and append all tags to HTML (without animation stylesheet).
   */
  private updateDomNodes(): void {
    const wrapper = this.rootEl.querySelector(ulSelector) as HTMLElement;
    const tpl = this.rootEl.querySelector(
      liTemplateSelector
    ) as HTMLTemplateElement;

    wrapper.innerHTML = "";

    for (let i = 0; i < this.currentItems.length; i++) {
      const tplClone = tpl.content.cloneNode(true) as DocumentFragment;
      const link = tplClone.querySelector(linkSelector) as HTMLAnchorElement;
      link.textContent = this.currentItems[i].text;

      if (!!this.currentItems[i].href) {
        link.href = this.currentItems[i].href!;
      }
      wrapper.appendChild(tplClone);
    }
  }

  /**
   * Clear animation stylesheet, generate animation configs and append new stylesheet.
   */
  private updateStyleSheet(): void {
    const configs: AnimationConfig[] = this.getConfigs(
      this.currentItems.length
    );
    const styleSheet = (this.rootEl.querySelector(
      animationStyleSelector
    ) as HTMLStyleElement).sheet as CSSStyleSheet;

    for (let i = styleSheet.cssRules.length - 1; i >= 0; i--) {
      styleSheet.removeRule(i);
    }

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const nthChild = i + 1;

      styleSheet.insertRule(`${liSelector}:nth-child(${nthChild}) {
        font-size: ${config.fontSizeEm}em;
        animation: rotate_${nthChild} ${config.secForTurn}s infinite linear, appear_${nthChild} ${config.rotationOffset}ms 1 forwards;
        animation-delay: ${config.rotationOffset}ms;
      }`);

      styleSheet.insertRule(`@keyframes appear_${nthChild} {
        0% {
          opacity: 0
        }
        100% {
          opacity: 1
        }
      }`);

      styleSheet.insertRule(`@keyframes rotate_${nthChild} {
        from {
          transform: rotate(${config.rotationOffset}deg) translateX(${
        config.translateX
      }px) rotate(-${config.rotationOffset}deg);
        }
        to {
          transform: rotate(${360 + config.rotationOffset}deg) translateX(${
        config.translateX
      }px) rotate(-${360 + config.rotationOffset}deg);
        }
      }`);
    }
  }

  /**
   * Get required amount of configs
   */
  private getConfigs(amount: number): AnimationConfig[] {
    const configs: AnimationConfig[] = [];
    for (let i = 0; i < amount; i++) {
      configs.push(this.getRandomConfig(amount, i));
    }
    return configs;
  }

  /**
   * Get single config
   *
   * @param total total count of required configs
   * @param i current config index
   */
  private getRandomConfig(total: number, i: number): AnimationConfig {
    // Generate config based on index to total ratio
    const randomSeed = i / total;
    return {
      fontSizeEm: Math.max(this.fontSizeMinEm, randomSeed * this.fontSizeRatio),
      secForTurn: this.secForTurn,
      rotationOffset: Math.floor(randomSeed * 360) * this.turns,
      translateX: Math.round(
        Math.max(
          this.titleSizePx,
          Math.round(randomSeed * (this.minSizePx / 2))
        )
      ),
    };
  }
}

export default TagWhirl;
