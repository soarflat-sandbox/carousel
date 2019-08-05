import events from 'events';
import anime from 'animejs';

/**
 * イベントのオプション出し分け
 */
const enablePassiveEventListeners = () => {
  let result = false;

  const opts =
    Object.defineProperty &&
    Object.defineProperty({}, 'passive', {
      get: () => {
        result = true;
      }
    });

  document.addEventListener('test', () => {}, opts);

  return result;
};

/*
 * Outer Width With Margin
 */
const outerWidth = el => {
  let width = el.offsetWidth;
  const style = getComputedStyle(el);

  width += parseInt(style.marginLeft) + parseInt(style.marginRight);
  return width;
};

/**
 * カルーセル
 * 要件
 * 進むボタン、戻るボタン
 * スワイプ
 * アクティビティインジケーター（ページャー）3/5 サムネイル
 * 自動スライド
 * リサイズ
 */
export default class CarouselUI extends events {
  /**
   * @param selector
   */
  constructor(selector, options = {}) {
    super();
    this.$el = document.querySelector(selector);
    this.$wrapper = this.$el.querySelector(`${selector}-wrapper`);
    this.$items = this.$el.querySelectorAll(`${selector}-item`);
    this.$prev = this.$el.querySelector(`${selector}-previous`);
    this.$next = this.$el.querySelector(`${selector}-next`);
    this.$dots = this.$el.querySelectorAll(`${selector}-dot`);

    this.threshold = 5;
    this.currentIndex = 0;
    this.length = this.$items.length;
    this.unitWidth = 0;

    this.duration = options.duration || 300;
    this.easing = options.easing || 'easeOutQuad';

    this.touched = false;
    this.offsetX = 0;
    this.lastDiffX = 0;

    this.classes = {
      active: 'is-active'
    };

    this.startTranslateX = 0;
    this.lastClientX = 0;
    this.lastTranslateX = 0;
    this.velocityX = 0;

    this.update();
    this.bind();
  }

  update() {
    const carouselWidth = this.$el.getBoundingClientRect().width;
    this.unitWidth =
      Math.floor(carouselWidth) === carouselWidth
        ? carouselWidth
        : Math.floor(carouselWidth) + 1;
    [...this.$items].forEach($item => {
      $item.style.width = `${this.unitWidth}px`;
    });
    anime.set(this.$wrapper, {
      translateX: -this.unitWidth * this.currentIndex
    });
  }

  bind() {
    const options = enablePassiveEventListeners() ? { passive: true } : false;

    window.addEventListener('load', this.update.bind(this), options);
    window.addEventListener('resize', this.update.bind(this), options);
    this.$next.addEventListener('click', this.next.bind(this), options);
    this.$prev.addEventListener('click', this.prev.bind(this), options);

    this.$el.addEventListener(
      'touchstart',
      this.handleSwipeStart.bind(this),
      options
    );
    this.$el.addEventListener(
      'touchmove',
      this.handleSwipeMove.bind(this),
      options
    );
    document.body.addEventListener(
      'touchend',
      this.handleSwipeEnd.bind(this),
      options
    );
  }

  handleSwipeStart(event) {
    this.lastClientX =
      event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    this.startTranslateX = parseFloat(anime.get(this.$wrapper, 'translateX'));
    this.lastTranslateX = this.startTranslateX;
    this.offsetX = 0;
    this.touched = true;
    this.lastDiffX = 0;

    anime.remove(this.$wrapper);
  }

  handleSwipeMove(event) {
    if (this.touched === false) return;

    const clientX =
      event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    const diffX = clientX - this.lastClientX;
    this.lastTranslateX = this.lastTranslateX + diffX;

    anime.set(this.$wrapper, {
      translateX: this.lastTranslateX
    });

    this.lastClientX = clientX;
    this.velocityX = diffX;
  }

  handleSwipeEnd() {
    this.touched = false;

    const diffX = this.lastTranslateX - this.startTranslateX;
    const isFast = Math.abs(this.velocityX) > this.threshold;

    if (isFast && diffX <= 0 && this.canNext) {
      this.next();
    } else if (isFast && diffX >= 0 && this.canPrev) {
      this.prev();
    } else {
      this.goTo(this.currentIndex);
    }

    this.velocityX = 0;
  }

  get canNext() {
    return this.currentIndex + 1 < this.length;
  }

  next() {
    if (!this.canNext) return;
    this.currentIndex += 1;
    this.goTo(this.currentIndex);
  }

  get canPrev() {
    return this.currentIndex > 0;
  }

  prev() {
    if (!this.canPrev) return;
    this.currentIndex -= 1;
    this.goTo(this.currentIndex);
  }

  goTo(index) {
    this.currentIndex = index;

    [...this.$dots].forEach(($dot, dotIndex) => {
      dotIndex === this.currentIndex
        ? $dot.classList.add(this.classes.active)
        : $dot.classList.remove(this.classes.active);
    });

    anime.remove(this.$wrapper);

    return anime({
      targets: this.$wrapper,
      translateX: -this.unitWidth * this.currentIndex,
      easing: this.easing,
      duration: this.duration
    }).finished;
  }
}
