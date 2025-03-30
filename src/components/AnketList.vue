<template>
  <div>
    <h2>Mevcut Anketler</h2>
    <div v-for="survey in surveys" :key="survey.id" class="survey">
      <h3>{{ survey.title }}</h3>
      <button @click="vote(survey)">Ankete Katıl</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "AnketList",
  props: ["surveys"],
  methods: {
    vote(survey) {
      this.$emit("vote", survey);
    }
  }
};
</script>

<style scoped>
.survey {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.2s ease-in-out;
}

.survey:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

h2 {
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
}

h3 {
  color: #34495e;
  margin: 0 0 15px 0;
  font-size: 1.4rem;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #3aa876;
}

@media (max-width: 768px) {
  .survey {
    padding: 15px;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  h3 {
    font-size: 1.2rem;
  }
}
</style>
