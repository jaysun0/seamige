const dom = {
  html: document.querySelector('html'),
  searchInput: document.querySelector('.search__input'),
  clearBtn: document.querySelector('.search__btn_clear'),
  findBtn: document.querySelector('.search__btn_find'),
  imagesContainer: document.querySelector('.main__images-container'),
  images: document.querySelectorAll('.main__image'),
  toTopBtn: document.querySelector('.main__btn_to-top'),
  loadMoreBtn: document.querySelector('.main__btn_load-more'),
  msgNoResults: document.querySelector('.main__msg_no-results'),
  msgNoMoreImages: document.querySelector('.main__msg_no-more-images'),
  //gallery elements
  gallery: document.querySelector('.gallery'),
  galleryImg: document.querySelector('.gallery__img'),
  galleryDownloadBtn: document.querySelector('.gallery__btn_download'),
  galleryCloseBtn: document.querySelector('.gallery__btn_close'),
  galleryNextBtn: document.querySelector('.gallery__btn_next'),
  galleryPreviousBtn: document.querySelector('.gallery__btn_previous'),
}

const state = {
  userQuery: 'animal',
  page: 1,
  maxPage: 15,
  imageLinks: [],
}


function resetState() {
  state.page = 1;
  state.imageLinks.length = 0;
  dom.imagesContainer.textContent = '';
  dom.msgNoResults.classList.add('hidden');
  dom.msgNoMoreImages.classList.add('hidden');
  dom.loadMoreBtn.classList.remove('hidden');
}


function processQuery() {
  const query = dom.searchInput.value;
  if(query) {
    state.userQuery = query;
    getImages(query)
  } else alert('You forget to enter a word :)');
}


function createImg(url, width, height, index) {
  const wrapper = document.createElement('div');
  const img = document.createElement('img');
  let imageIndex = Number(`${state.page - 1}${index}`);

  img.setAttribute('alt', 'photo from unsplash');
  img.setAttribute('src', url);
  img.classList.add('main__image');
  img.dataset.index = `${imageIndex}`;
  width < height ? img.style.width = '100%' : img.style.height = '100%';
  img.addEventListener('click', () => openGallery(imageIndex));
  
  wrapper.classList.add('main__image-wrapper');
  wrapper.appendChild(img);
  dom.imagesContainer.appendChild(wrapper);
}


async function getImages(query) {
    resetState();
    state.userQuery = query;
    const response = await fetch(`https://api.unsplash.com/search/photos?client_id=vCUNdrv_1RKAimNFAGd8tVQ65MXX8dNGFFOUyIsT6b8&age=1&query=${query}`);
    const data = await response.json();

    if (data.results.length) {
      dom.toTopBtn.classList.remove('hidden');
      data.results.forEach((item, ind) => {
        const regular = item.urls.regular;
        const full = item.urls.full;
        state.imageLinks.push({
          regular,
          full
        });
        createImg(regular, item.width, item.height, ind);
      });
    } else {
      dom.toTopBtn.classList.add('hidden');
      dom.msgNoMoreImages.classList.add('hidden');
      dom.loadMoreBtn.classList.add('hidden');
      dom.msgNoResults.classList.remove('hidden');
    }
}


function getMoreImages(){
  if(++state.page < state.maxPage){
    const url = `https://api.unsplash.com/search/photos?client_id=vCUNdrv_1RKAimNFAGd8tVQ65MXX8dNGFFOUyIsT6b8&page=${state.page}&query=${state.userQuery}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.results.length) {
          data.results.forEach((item, ind) => {
            state.imageLinks.push({
              regular: item.urls.regular,
              full: item.urls.full,
            });
            createImg(item.urls.regular, item.width, item.height, ind);
          });
        } else dom.msgNoMoreImages.classList.remove('hidden');
      })
      .catch(() => console.log('Smth went wrong with request...'));
  }
}


function openGallery(index) {
  dom.html.style.overflow = 'hidden';
  dom.gallery.style.top = `${window.scrollY}px`;
  dom.gallery.classList.remove('hidden');
  dom.galleryImg.dataset.index = index;
  dom.galleryImg.setAttribute('src', state.imageLinks[index].regular);
  dom.galleryDownloadBtn.dataset['link'] = state.imageLinks[index].full;
}

async function downloadImage() {
  const imageData = await fetch(dom.galleryDownloadBtn.dataset['link']);
  const imageBlob = await imageData.blob();
  const imageUrl = URL.createObjectURL(imageBlob);
  const partOfTheNameArray = imageUrl.split('-');
  const partOfTheName = partOfTheNameArray[partOfTheNameArray.length - 1];
  const linkToDownload = document.querySelector('.image-to-download__link');

  linkToDownload.href = imageUrl;
  linkToDownload.download = `seamige-${partOfTheName}.jpg`;
  linkToDownload.click();
}


function closeGallery() {
  dom.gallery.classList.add('hidden');
  dom.html.style.overflow = 'auto';
}


function nextImage(direction) {
  let index = Number(dom.galleryImg.dataset.index);
  let next;

  if (direction === 'next') {
    next = index + 1;
    if (next === state.imageLinks.length) next = 0; 
  } else {
    next = index - 1;
    if (next === -1) next = state.imageLinks.length - 1; 
  }

  dom.galleryImg.setAttribute('src', state.imageLinks[next].regular);
  dom.galleryDownloadBtn.dataset['link'] = state.imageLinks[next].full;
  dom.galleryImg.dataset.index = `${next}`;
}



/****** EVENT LISTENERS ******/
dom.galleryDownloadBtn.addEventListener('click', downloadImage);

//search input
dom.findBtn.addEventListener('click', processQuery);
dom.clearBtn.addEventListener('click', () => {
  dom.searchInput.value = '';
  dom.searchInput.focus();
});

//load more button 
dom.loadMoreBtn.addEventListener('click', getMoreImages);

//gallery
dom.galleryNextBtn.addEventListener('click', e => {
  e.stopPropagation();
  nextImage('next');
});
dom.galleryPreviousBtn.addEventListener('click', e => {
  e.stopPropagation();
  nextImage('prevoius')
});
dom.galleryCloseBtn.addEventListener('click', closeGallery);

//general events
document.addEventListener('keypress', event => {
  if(event.key.toLowerCase() === 'enter') processQuery();
});

document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (key === 'escape') closeGallery();
  else if (key === 'arrowright') nextImage('next');
  else if (key === 'arrowleft') nextImage('previous');
});

getImages('animal');
dom.searchInput.focus();
