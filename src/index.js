import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const apiKey = '42667221-e17031dd8773ae279d6f89390';
const imageType = 'photo';
const orientation = 'horizontal';
const safesearch = true;
let page = 1;
const per_page = 40;
let query = null;

const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const form  = document.querySelector('.search-form');
const loadMoreButton = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a', {
  showCounter: true,
  overlay: true,
});

function toggleLoader(show) {
  loader.style.display = show ? 'block' : 'none';
}

function toggleMoreButton(show) {
  loadMoreButton.style.display = show ? 'block' : 'none';
}

function showError(err) {
  console.error('Error:', err);
  Notiflix.Notify.failure('Oops! Something went wrong! Try reloading the page!');
}

async function fetchImages(phrase = null, page = 1) {
  try {
    const response = await axios.get('https://pixabay.com/api', {
      params: {
        key: apiKey,
        q: phrase,
        image_type: 'photo',
        orientation: orientation,
        safesearch: safesearch,
        page: page,
        per_page: per_page,
      }
    });

    totalHits = response.data.totalHits;

    return response.data.hits.map(image => ({
      id: image.id,
      thumbnail: image.webformatURL,
      url: image.largeImageURL,
      tags: image.tags,
      likes: image.likes,
      views: image.views,
      downloads: image.downloads,
      comments: image.comments,
    }));
  } catch (error) {
    throw new Error(error.message);
  }
}

function clearGallery() {
  gallery.innerHTML = '';
}

function renderImages(images) {
  images.forEach(image => {
    const rowWrapper = document.createElement('div');
    const link = document.createElement('a');
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

    link.href = image.url;

    img.value = image.id;
    img.src = image.thumbnail;
    img.alt = image.tags;
    img.loading = 'lazy';

    infoItemLikes.textContent = `Likes: ${image.likes}`;
    infoItemViews.textContent = `Views: ${image.views}`;
    infoItemDownloads.textContent = `Downloads: ${image.downloads}`;
    infoItemComments.textContent = `Comments: ${image.comments}`;

    gallery.appendChild(rowWrapper);
    rowWrapper.appendChild(link);
    link.appendChild(img);
    rowWrapper.appendChild(metaWrapper);
    metaWrapper.appendChild(infoItemLikes);
    metaWrapper.appendChild(infoItemViews);
    metaWrapper.appendChild(infoItemComments);
    metaWrapper.appendChild(infoItemDownloads);
  });

  lightbox.refresh();
}

document.addEventListener('DOMContentLoaded', () => {
  toggleLoader(false);
  localStorage.clear();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  toggleMoreButton(false);
  clearGallery();

  const data = new FormData(form);
  query = data.get('searchQuery');
  localStorage.setItem('page', '1');

  if (query) {
    toggleLoader(true);
    try {
      const images = await fetchImages(query);
      renderImages(images);
      toggleMoreButton(images.length > 0);
      if (images.length === 0) {
        Notiflix.Notify.failure(`No photos with phrase "${query}" found`);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      toggleLoader(false);
    }
  } else {
    Notiflix.Notify.warning('Please enter a search query.');
  }
});

loadMoreButton.addEventListener('click', async () => {
  const lastPage = localStorage.getItem('page');
  const currentPage = (parseInt(lastPage) + 1).toString();
  localStorage.setItem('page', currentPage);

  try {
    const pageImages = await fetchImages(query, currentPage);
    renderImages(pageImages);
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  } catch (error) {
    showError(error.message);
  }
});
