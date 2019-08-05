import CarouselUI from './modules/CarouselUI';

/**
 * INDEX LOGIC
 */
class Index {
  /**
   * constructor
   */
  constructor() {
    this.carouselUI = new CarouselUI('.carousel', {
      duration: 300,
      easing: 'easeOutQuad'
    });
  }
}

window.INDEX = new Index();
