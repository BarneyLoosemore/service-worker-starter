const BUTTONS = [
  {
    name: "prev",
    className: "prev",
  },

  {
    name: "next",
    className: "next",
  },
];

const arrowSvg = `
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 18L9 12L15 6"
      stroke="#FFFF"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;

class Carousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          left: 0;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        button.next {
          left: auto;
          right: 0;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        svg {
          filter: drop-shadow(0px 2px 10px rgba(27, 27, 27, 0.75));

        }

        button.next svg {
          transform: rotate(180deg);
          filter: drop-shadow(0px -2px 10px rgba(27, 27, 27, 0.75));
        }
      </style>
      <slot></slot>
    `;

    const slot = this.shadowRoot.querySelector("slot");

    this.carousel = slot.assignedElements()[0];
    this.slides = [...slot.assignedElements()[0].children];
    this.totalSlides = this.slides.length;
    this.currentSlide = 0;

    BUTTONS.forEach((button) => {
      const btn = document.createElement("button");
      btn.innerHTML = arrowSvg;
      btn.className = button.className;
      this[button.name + "Btn"] = btn;
      this.shadowRoot.appendChild(btn);
    });

    const iO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.currentSlide = this.slides.indexOf(entry.target);
          }
          this.prevBtn.disabled = this.currentSlide === 0;
          this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        });
      },
      {
        threshold: 1.0,
      }
    );

    this.prevBtn.onclick = () => this.goToPrevSlide();
    this.nextBtn.onclick = () => this.goToNextSlide();

    this.slides.forEach((slide) => {
      iO.observe(slide);
    });
  }

  goToNextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide = this.currentSlide + 1;
      this.slides[this.currentSlide].scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
    }
  }

  goToPrevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide -= 1;
      this.slides[this.currentSlide].scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
    }
  }
}

customElements.define("image-carousel", Carousel);
