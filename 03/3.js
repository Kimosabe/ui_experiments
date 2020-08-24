var app = new Vue({
  el: '#app',
  data: {
    items: [
        "elem_0",
        "elem_1",
        "elem_2",
        "elem_3",
        "elem_4",
        "elem_5",
    ],
    currentStep: 0,
  },
  methods: {
    shift: function(step) {
        this.currentStep += step;
        if (this.currentStep < 0) this.currentStep = this.items.length - 1;
        if (this.currentStep >= this.items.length) this.currentStep = 0;

        this.$refs.carousel.scrollLeft = 92*this.currentStep;
    },
  }
});
