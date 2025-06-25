const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const overplay = $(".overplay");
const itemsHeaderRight = $$(".header-right__item");
const newNotifyList = $(".notify-content__new-list");
const oldNotifyList = $(".notify-content__before-list");

const obj = JSON.parse(localStorage.getItem("obj")) || {};

//close overplay
if (overplay) {
  overplay.onclick = (e) => {
    if (!e.target.closest(".overplay-body")) {
      overplay.style.display = "none";
      document.body.style.overflow = "auto";
    }
  };
}

//dark mode
const darkBtns = $$(".header-switch__box ");
const appComponent = $(".app");

if (darkBtns && appComponent) {
  darkBtns.forEach((dark) => {
    dark.onclick = function () {
      if (this.classList.contains("dark")) {
        this.classList.remove("dark");
        appComponent.classList.remove("dark");
        obj.mode = "light";
      } else {
        this.classList.add("dark");
        appComponent.classList.add("dark");
        obj.mode = "dark";
      }

      localStorage.setItem("obj", JSON.stringify(obj));
    };
  });
}

//show, hide menu sub header right
if (itemsHeaderRight.length != 0) {
  itemsHeaderRight.forEach((item) => {
    item.onclick = () => {
      const toggle = $(".nav-left-layout");
      const itemActive = $(".header-right__item.active");
      item.classList.toggle("active");
      if (toggle) {
        const containerLeft = $(".container-left");
        toggle.classList.remove("active");
        if (containerLeft) {
          containerLeft.classList.remove("active");
        }
      }
      if (itemActive) {
        itemActive.classList.remove("active");
      }
    };
  });

  const titleNewNotify = $(".new-notify__title");

  if (titleNewNotify) {
    
    const notifiesHeader = (() => {
      const notifies = [
        {
          id: 0,
          path: "./assets/img/Home/avatar-notify-1.jpg",
          content: `the admin has updated the group rules, u gotta be
                    <span>Gentle ∆</span>
                    . `,
          time: 3,
          seen: false,
        },
        {
          id: 1,
          path: "./assets/img/Home/avatar-notify-2.jpg",
          content: `The_one and TRUMP_SUPPORTER have commented on your post.
                    `,
          time: 13,
          seen: false,
        },
        {
          id: 2,
          path: "./assets/img/Home/avatar-notify-3.jpg",
          content: `<span>KIM_JONG_UN</span>
                    has mentioned you in a comment.`,
          time: 20,
          seen: false,
        },
        {
          id: 3,
          path: "./assets/img/Home/avatar-notify-4.jpg",
          content: `<span>Titan Gaming</span>
                    has uploaded new photos to his album.`,
          time: 23,
          seen: false,
        },
        {
          id: 4,
          path: "./assets/img/Home/avatar-notify-5.jpg",
          content: `<span>Linh Trang</span>
                    and others have liked 
                    <span>Student Union Offical's</span> post.`,
          time: 30,
          seen: true,
        },
        {
          id: 5,
          path: "./assets/img/Home/avatar-notify-6.jpg",
          content: `<span>Lê_Chan</span>
                   recenlty posted a video.`,
          time: 45,
          seen: true,
        },
        {
          id: 6,
          path: "./assets/img/Home/avatar-notify-7.jpg",
          content: `<span>Boruto san</span>
                    has sent u a friend request.`,
          time: 52,
          seen: true,
        },
      ];

      return {
        render(arr, component) {
          const htmls = arr
            .map((notify, index) => {
              return `
                        <li data-index="${
                          notify.id
                        }" class="notify-content__item ${
                notify.seen ? "seen" : null
              }">
                            <img src="${
                              notify.path
                            }" alt="" class="notify-content__item-avatar">
                            <div class="notify-content__item-content">
                                <div class="notify-content__item-content-text">
                                    ${notify.content}
                                </div>
                                <p " class="notify-content__item-time">
                                    ${notify.time} phút trước
                                </p>
                            </div>
                            <i class="fas fa-circle"></i>
                        </li>
                        `;
            })
            .join("");
          component.innerHTML = htmls;
        },
        renderNotify() {
          const titleNewNotify = $(".new-notify__title");
          const countNotify = $(".header-right__item-count");
          const newNotifies = notifies.filter((notify) => !notify.seen);
          const oldNotifies = notifies.filter((notify) => notify.seen);

          if (titleNewNotify) {
          }
          
          if (newNotifies.length === 0) {
            titleNewNotify.style.display = "none";
            countNotify.style.display = "none";
          } else {
            titleNewNotify.style.display = "block";
            countNotify.innerHTML = newNotifies.length;
            countNotify.style.display = "flex";
          }

          this.render(newNotifies, newNotifyList);
          this.render(oldNotifies, oldNotifyList);
        },
        handle() {
          
          newNotifyList.onclick = (e) => {
            const itemNew = e.target.closest(".notify-content__item");
            if (itemNew) {
              const id = itemNew.dataset.index;
              notifies[id].seen = true;
              this.renderNotify();
            }
          };

          setInterval(() => {
            notifies.forEach((notify) => {
              notify.time += 1;
            });
            this.renderNotify();
          }, 60000);
        },
        start() {
          this.renderNotify();
          this.handle();
        },
      };
    })().start();
  }
}

window.onclick = function (e) {
 
  if (itemsHeaderRight.length != 0) {
    const menuSub =
      e.target.closest(".header-right__item") ||
      e.target.closest(".header-right__item-more");
    if (!menuSub) {
      itemsHeaderRight.forEach((item) => {
        item.classList.remove("active");
      });
    }
  }


  if ($(".newsfeed__info-setting-list")) {
    if (
      !e.target.closest(".newsfeed__info-setting-list.active") &&
      !e.target.closest(".newsfeed__info-setting.more-dots")
    ) {
      $$(".newsfeed__info-setting-list.active").forEach((item) => {
        item.classList.remove("active");
      });
    }
  }
};

// storage
const F = (() => {
  const users = [
    {
      id: 0,
      firstName: "lord",
      lastName: "Fly",
      fullName: "lord Fly",
      phone: "0123123123",
      password: "123",
      avatar: "./assets/img/Home/thangfly.jpg",
      bg: "./assets/img/Home/thangfly-bg.jpg",
      postLiked: ["1", "2"],
      cmtLiked: ["0"],
      isLogin: false,
      onl: 0,
    },
    {
      id: 1,
      firstName: "",
      lastName: "Freight AP TV",
      fullName: "Freight AP TV",
      phone: "0123123124",
      password: "123",
      avatar: "./assets/img/Home/user-2.jpg",
      postLiked: ["0"],
      cmtLiked: ["1"],
      isLogin: false,
      onl: 0,
    },
    {
      id: 2,
      firstName: "Demo",
      lastName: "User",
      fullName: "Demo User",    
      phone: "0000000000",
      password: "123456",
      avatar: "./assets/img/avatar-nam.jpg",
      postLiked: [],
      cmtLiked: [],
      isLogin: false,
      onl: 0,
    },
  ];

  const newfeeds = [
    {
      id: 0,
      idUser: 0,
      time: 1,
      bg: "./assets/img/Home/thangfly-bg.jpg",
      content: "Life is too short, consider donating blood to others at this time",
      like: 6800,
      cmt: 55,
      share: 121,
      deleted: false,
    },
    {
      id: 1,
      idUser: 1,
      time: 4,
      bg: "./assets/img/Home/ape.avif",
      content: "Guys i made a new nft anyone interested in buying?",
      like: 2300,
      cmt: 52,
      share: 82,
      deleted: false,
    },
    {
      id: 2,
      idUser: 1,
      time: 7,
      bg: "./assets/img/Home/ukri.jpg",
      content:
        "Ukraine needs ur help, please donate to this wallet ###-###-###-### , directy from u to us , no middle men",
      like: 1200,
      cmt: 42,
      share: 21,
      deleted: false,
    },
  ];

  const comments = [
    {
      id: 0,
      idUser: 0,
      idPost: 1,
      content: "Thats a really nice nft, whats it worth?",
      like: 252,
      sub: false,
      deleted: false,
    },
    {
      id: 1,
      idUser: 1,
      idPost: 1,
      content: "Guys , do you like this nft?",
      like: 134,
      sub: false,
      deleted: false,
    },
    {
      id: 2,
      idUser: 1,
      idPost: 0,
      content: "Just donated blood yesterday, it was a great experience, and honestly felt rejuvenating",
      like: 152,
      sub: false,
      deleted: false,
    },
    {
      id: 3,
      idUser: 0,
      idPost: 1,
      content:"this is good art work, i like it",
      like: 12,
      sub: true,
      deleted: false,
      parentIdCmt: 1,
    },
    {
      id: 4,
      idUser: 1,
      idPost: 1,
      content: "Thanks!, i'm thinking to sell it for 10 XDC",
      like: 11,
      sub: true,
      deleted: false,
      parentIdCmt: 0,
    },
  ];

  const obj = {
    mode: "dark",
  };
  //wtf is this?????????????
  const messengers = [
    {
      id: 0,
      idUser: 0,
      Author: true,
      content: "Are u alright?",
      deleted: false,
      isReact: true,
      endMess: false,
    },
    {
      id: 1,
      idUser: 0,
      Author: false,
      content: "Im fine worries",
      deleted: false,
      isReact: false,
      endMess: true,
    },
    {
      id: 2,
      idUser: 1,
      Author: true,
      content: "Hey i can pay 4 bitcoin for that nft ? what do u say?",
      deleted: false,
      isReact: true,
      endMess: false,
    },
    {
      id: 3,
      idUser: 1,
      Author: false,
      content: "NO way i have already sold it",
      deleted: false,
      isReact: false,
      endMess: true,
    },
    {
      id: 4,
      idUser: 2,
      Author: false,
      content: "i cant...",
      deleted: false,
      isReact: true,
      endMess: false,
    },
    {
      id: 5,
      idUser: 2,
      Author: true,
      content: "WDYM?",
      deleted: false,
      isReact: true,
      endMess: true,
    },
  ];

  return {
    setStorage() {
      localStorage.getItem("users")
        ? null
        : localStorage.setItem("users", JSON.stringify(users));

      localStorage.getItem("newfeeds")
        ? null
        : localStorage.setItem("newfeeds", JSON.stringify(newfeeds));

      localStorage.getItem("comments")
        ? null
        : localStorage.setItem("comments", JSON.stringify(comments));

      localStorage.getItem("obj")
        ? null
        : localStorage.setItem("obj", JSON.stringify(obj));

      localStorage.getItem("messengers")
        ? null
        : localStorage.setItem("messengers", JSON.stringify(messengers));
    },
  };
})().setStorage();
