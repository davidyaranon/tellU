export function toast(message: string, duration = 2000) {
    const t = document.createElement('ion-toast');
    t.message = 'Your settings have been saved.';
    t.duration = 2000;
  
    document.body.appendChild(t);
    return t.present();
}

