/**
 * Class names
 */
const titleClassName = "title";
const ulClassName = "listContainer";
const liTemplateId = "listItemId";
const liClassName = "listItem";
const linkClassName = "listItemLink";

/**
 * Selectors
 */
const itemWrapperSelector = `.${ulClassName}`;
const itemSelector = `.${liClassName}`;
const itemLinkSelector = `.${linkClassName}`;
const itemTplSelector = `#${liTemplateId}`;
const titleSelector = `.${titleClassName}`;

/**
 * Create template node.
 * Syntax highlighting for VSCode is available with 'es6-string-html' extension.
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
      color: var(--text-color);
      text-decoration: none;
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
      color: var(--color-accent);
      background: black;
      font-size: 1.5em;
    }
  </style>
  <style>
    /* here will be generated css */
  </style>
  <h1 class="${titleClassName}">
    <slot name="title"></slot>
  </h1>
  <ul class="${ulClassName}"></ul>

  <template id="${liTemplateId}">
    <li class="${liClassName}"><a class="${linkClassName}"></a></li>
  </template>
`;

export interface TagOption {
  text: string;
  href?: string;
}

interface AnimationConfig {
  fontSizeEm: number;
  secForTurn: number;
  rotationOffset: number;
  translateX: number;
}

export class TagWhirl extends HTMLElement {
  public turns: number = 3;
  public secForTurn: number = 50;
  public fontSizeMinEm: number = 0.7;
  public fontSizeRatio: number = 1.5;

  public set items(value: TagOption[]) {
    this.setItems(value);
  }
  public get items(): TagOption[] {
    return this.currentItems;
  }

  private currentItems: TagOption[] = [];

  private get rootEl(): ShadowRoot {
    return this.shadowRoot || this.attachShadow({ mode: "open" });
  }

  private containerMinSizePx: number = 400;

  private titleSizePx: number = 0;

  static get observedAttributes(): string[] {
    return [
      "items",
      "turns",
      "sec-for-turn",
      "font-size-min-em",
      "font-size-multiplier",
    ];
  }

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
      case "font-size-multiplier":
        this.fontSizeMinEm = +newValue;
        this.updateStyleSheet();
        break;
      default:
        break;
    }
  }

  public connectedCallback(): void {
    this.rootEl.appendChild(template.content.cloneNode(true));

    this.updateTitle();
    this.updateSize();
  }

  private setItems(value: TagOption[]): void {
    this.currentItems = this.normalizeValue(value);
    this.updateDomNodes();
    this.updateStyleSheet();
  }

  private updateSize(): void {
    this.containerMinSizePx = Math.min(this.offsetHeight, this.offsetWidth);
  }

  private updateTitle(): void {
    const titleEL = this.rootEl.querySelector(titleSelector) as HTMLElement;

    this.titleSizePx = Math.max(titleEL?.clientHeight, titleEL.clientWidth);
  }

  private normalizeValue(value: TagOption[]): TagOption[] {
    return value.sort((a, b) =>
      !!a && !!b ? a.text.length - b.text.length : 0
    );
  }

  private updateDomNodes(): void {
    const wrapper = this.rootEl.querySelector(
      itemWrapperSelector
    ) as HTMLElement;
    const tpl = this.rootEl.querySelector(
      itemTplSelector
    ) as HTMLTemplateElement;

    wrapper.innerHTML = "";

    for (let i = 0; i < this.currentItems.length; i++) {
      const tplClone = tpl.content.cloneNode(true) as DocumentFragment;
      const link = tplClone.querySelector(
        itemLinkSelector
      ) as HTMLAnchorElement;
      link.textContent = this.currentItems[i].text;
      if (!!this.currentItems[i].href) {
        link.href = this.currentItems[i].href!;
      }
      wrapper.appendChild(tplClone);
    }
  }

  private updateStyleSheet(): void {
    const configs: AnimationConfig[] = this.getConfigs(
      this.currentItems.length
    );
    const styleSheet = this.rootEl.styleSheets.item(
      this.rootEl.styleSheets.length - 1
    ) as CSSStyleSheet;

    for (let i = styleSheet.cssRules.length - 1; i >= 0; i--) {
      styleSheet.removeRule(i);
    }

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const nthChild = i + 1;

      styleSheet.insertRule(`${itemSelector}:nth-child(${nthChild}) {
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
   * Get animated items and configs
   */
  private getConfigs(amount: number): AnimationConfig[] {
    const configs: AnimationConfig[] = [];
    for (let i = 0; i < amount; i++) {
      configs.push(this.getRandomConfig(amount, i));
    }
    return configs;
  }

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
          Math.round(randomSeed * (this.containerMinSizePx / 2))
        )
      ),
    };
  }
}

customElements.define("vk-skill-whirl", TagWhirl);

export default TagWhirl;
