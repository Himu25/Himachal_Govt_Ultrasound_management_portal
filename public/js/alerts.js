document.addEventListener('DOMContentLoaded', () => {
    const toast = document.querySelector('.toast');
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 3000);
  });