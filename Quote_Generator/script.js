const quotes = [
    {
      text: "Be the change that you wish to see in the world.",
      author: "Mahatma Gandhi"
    },
    {
      text: "The only true wisdom is in knowing you know nothing.",
      author: "Socrates"
    },
    {
      text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
      author: "Gautama Buddha"
    },
    {
      text: "In the middle of every difficulty lies opportunity.",
      author: "Albert Einstein"
    },
    {
      text: "You must be the master of your own destiny.",
      author: "Swami Vivekananda"
    },
    {
      text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      author: "Winston Churchill"
    },
    {
      text: "Yoga is the journey of the self, through the self, to the self.",
      author: "Bhagavad Gita"
    },
    {
      text: "Happiness is not something ready-made. It comes from your own actions.",
      author: "Dalai Lama"
    },
    {
      text: "Your time is limited, so don’t waste it living someone else’s life.",
      author: "Steve Jobs"
    },
    {
      text: "When you want something, all the universe conspires in helping you to achieve it.",
      author: "Paulo Coelho"
    }
  ];
  

function change() {
    var quote = document.getElementById("quote");
    var author = document.getElementById("author");

    const random_index = Math.floor(Math.random() * quotes.length);
    const q = quotes[random_index];

    quote.innerHTML = q.text;
    author.innerHTML = q.author;
}
