sendReview = () => {
    event.preventDefault();
    let author = getParameterByName(txtauthor);
    let rating = getParameterByName(cmbrating).value;
    let comment = getParameterByName(txtcomment);
  
    console.log(`Review:${author}, ${rating}, commento: ${comment}`);
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addReview')
      .addEventListener('click', sendReview);
  });