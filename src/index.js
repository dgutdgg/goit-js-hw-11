import axios from 'axios';
import Notiflix from 'notiflix';

const apiKey = '42667221-e17031dd8773ae279d6f89390';
const imageType = 'photo';
const orientation = 'horizontal';
const safesearch = true;

const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const form = document.querySelector('.search-form');

axios.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;

function toggleLoader(show) {
  if (show) {
    loader.style.display = 'block';
  } else {
    loader.style.display = 'none';
  }
}

function showError(message) {
  console.error('Error:', message);
  Notiflix.Notify.failure(message);
}

let currentPage = 1;
const loadMoreButton = document.querySelector('.load-more');

async function fetchImages(phrase) {
  try {
    const response = await axios.get('https://pixabay.com/api', {
      params: {
        key: apiKey,
        image_type: imageType,
        orientation: orientation,
        safesearch: safesearch,
        page: currentPage,
        per_page: 40,
      }
    });

    currentPage++; 

    const totalHits = response.data.totalHits;

    if (currentPage === 2) {
      loadMoreButton.style.display = 'block';
    }

    if (totalHits <= currentPage * 40) {
      loadMoreButton.style.display = 'none';
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }

    const images = response.data.hits.map(image => ({
      id: image.id,
      url: image.webformatURL,
      likes: image.likes,
      views: image.views,
      comments: image.comments,
      downloads: image.downloads,
    }));

    return images;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function renderImages(phrase) {
  try {
    toggleLoader(true);

    const images = await fetchImages(phrase);

    if (images.length === 0) {
      Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
    } else {
      gallery.innerHTML = '';

      images.forEach(image => {
        const rowWrapper = document.createElement('div');
        const img = document.createElement('img');
        const metaWrapper = document.createElement('div');
        const infoItemLikes = document.createElement('p');
        const infoItemViews = document.createElement('p');
        const infoItemComments = document.createElement('p');
        const infoItemDownloads = document.createElement('p');

        infoItemLikes.classList.add('info-item');
        infoItemViews.classList.add('info-item');
        infoItemComments.classList.add('info-item');
        infoItemDownloads.classList.add('info-item');

        rowWrapper.classList.add('photo-card');
        metaWrapper.classList.add('info');

        img.value = image.id;
        img.src = image.url;
        img.loading = 'lazy';

        infoItemLikes.innerHTML = 'Likes: ' + image.likes;
        infoItemViews.innerHTML = 'Views: ' + image.views;
        infoItemDownloads.innerHTML = 'Downloads: ' + image.downloads;
        infoItemComments.innerHTML = 'Comments: ' + image.comments;

        gallery.appendChild(rowWrapper);
        rowWrapper.appendChild(img);
        rowWrapper.appendChild(metaWrapper);
        metaWrapper.appendChild(infoItemLikes);
        metaWrapper.appendChild(infoItemViews);
        metaWrapper.appendChild(infoItemComments);
        metaWrapper.appendChild(infoItemDownloads);
      });
    }
  } catch (error) {
    showError(error.message);
  } finally {
    toggleLoader(false);
  }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const query = data.get('searchQuery');

    if (query) {
      currentPage = 1;
      renderImages(query);
    } else {
      Notiflix.Notify.warning('Please enter a search query.');
    }
  });

  loadMoreButton.addEventListener('click', () => {
    const data = new FormData(form);
    const query = data.get('searchQuery');
    renderImages(query);
  });
