<template>
  <div class="survey">
    <h2>Yeni Anket Oluştur</h2>
    <input v-model="title" placeholder="Anket Başlığı" />
    <div v-for="(question, index) in questions" :key="index">
      <input v-model="question.text" placeholder="Soru Girin" />
      <div v-for="(option, optIndex) in question.options" :key="optIndex">
        <input v-model="question.options[optIndex]" placeholder="Seçenek" />
      </div>
      <button @click="addOption(index)">Seçenek Ekle</button>
    </div>
    <button @click="addQuestion">Soru Ekle</button>
    <button @click="createSurvey">Anketi Oluştur</button>
  </div>
</template>

<script>
export default {
  name: "CreateSurvey",
  data() {
    return {
      title: "",
      questions: [{ text: "", options: [""] }],
    };
  },
  methods: {
    addQuestion() {
      this.questions.push({ text: "", options: [""] });
    },
    addOption(questionIndex) {
      this.questions[questionIndex].options.push("");
    },
    createSurvey() {
      const newSurvey = {
        id: Date.now(),
        title: this.title,
        questions: this.questions,
      };
      this.$emit("surveyCreated", newSurvey);
      this.title = "";
      this.questions = [{ text: "", options: [""] }];
    },
  },
};
</script>

<style scoped>
/* Özel stil ayarları burada yapılabilir */
</style>
