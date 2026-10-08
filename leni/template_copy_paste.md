This is the galery placeholder.
It is setup to work in a grid of 4 on the side, every picture after 4 is automaticaly set in a new line and stays in
that line untill the new row of pictures gets to 4, then it goes into a new line.

Pictures used in the galery are located in ../assets/galery/
each photo uses lazy loading so they will not be loaded untill a person scrolls or goes to that specific picture
saving loading times.

This uses the local script.js folder, if using in another folder, make sure to copy the browse features from style and script.
Make sure its located in the <template></template> section.

<template class="profile-desc">
        <p class="text">
            info about this class
        </p>
        </div>
        <h3 class="widget-title" style="margin: 40px 0 16px">
            Gallery
        </h3>
        <div class="gallery-grid">
            <div
            class="gallery-item"
            tabindex="0"
            role="button"
            aria-haspopup="dialog"
            >
            <img
                src="../assets/galery/placeholder.svg"
                alt="Gallery photo 1"
                loading="lazy"
            />
            </div>
            <div
            class="gallery-item"
            tabindex="0"
            role="button"
            aria-haspopup="dialog"
            >
            <img
                src="../assets/galery/placeholder.svg"
                alt="Gallery photo 2"
                loading="lazy"
            />
            </div>
            <div
            class="gallery-item"
            tabindex="0"
            role="button"
            aria-haspopup="dialog"
            >
            <img
                src="../assets/galery/placeholder.svg"
                alt="Gallery photo 2"
                loading="lazy"
            />
            </div>
        </div>
        </template>

<!--
!====================================================================================================
 -->

Popup button. When clicking this button, it will open a "popup" with information written inside it.
The information is located in local scripts file.

<div
    class="widget-tile widget-tile--1"
    data-popup="fact"
    tabindex="0"
    role="button"
    aria-haspopup="dialog"
    style="max-width: 320px; margin: 20px 0"
>
    <h3 class="widget-title">Lorem ipsum</h3>
    <p class="widget-text">
    Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
    </p>
</div>

vvvvvvvvvvvvvv Script vvvvvvvvvvvvvv

fact: {
title: "Lorem ipsum",
body: `<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ex velit dui risus nisl nunc. Duis justo felis auctor quisque sem. Lacus ligula justo ex leo justo ut.
Mauris justo est malesuada sollicitudin erat eu lectus nulla. Arcu volutpat vestibulum nulla suspendisse augue massa tortor pellentesque. Morbi vestibulum tellus iaculis ut diam rutrum vehicula ac neque id ligula. A porttitor sapien mi volutpat commodo tellus et lacinia eget eget. Consectetur donec mauris sodales scelerisque eleifend sit sed aenean in mollis lorem lectus. Id nisi vestibulum auctor amet in ac laoreet non nam viverra fermentum condimentum. Et vel vivamus sem viverra tempor tempor quam sit sed commodo nulla consectetur vel. Quis consectetur mauris at mauris.

</p>
<p>
    In faucibus feugiat amet ut quam a sapien at dolor suspendisse euismod quam. Luctus tellus nunc vitae ut diam felis. Proin aliquam magna ac eleifend vel egestas. Placerat et at lorem proin ut sagittis suspendisse varius neque eleifend nunc nisi.

    Rhoncus sit quisque lacus egestas. Egestas libero donec euismod purus consectetur scelerisque at suscipit et mauris. Et sed eget consequat posuere. Nisi suscipit amet nisl porttitor condimentum et.

</p>
`,
},

<!--
!====================================================================================================
 -->
