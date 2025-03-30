<template>
  <div>
    <h2>{{ survey.title }} - Anket</h2>
    <div v-for="(question, index) in survey.questions" :key="index">
      <h3>{{ question.text }}</h3>
      <div v-for="(option, optIndex) in question.options" :key="optIndex">
        <label>
          <input type="radio" :name="`question-${index}`" :value="optIndex" v-model="answers[index]" />
          {{ option }}
        </label>
      </div>
    </div>
    <button @click="submitVote">Oy Ver</button>
  </div>
</template>

<script>
export default {
  name: "SurveyVote",
  props: ["survey"],
  data() {
    return {
      answers: [],
    };
  },
  methods: {
    submitVote() {
      console.log("Oy verildi:", this.answers);
    },
  },
};
</script>