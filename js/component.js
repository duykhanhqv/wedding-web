/* Logic của thiệp (đếm ngược, chuyển ảnh, lời chúc...).

   Runtime dc đọc mã từ textContent của thẻ <script data-dc-script> trong
   index.html, nên file này tự nạp mã vào thẻ đó. Trước đây index.html lấy
   file bằng XHR đồng bộ, nhưng trình duyệt chặn XHR khi mở bằng file://
   (mở thẳng file, không qua web server) — khi đó toàn bộ phần chạy được của
   thiệp im lặng chết: hai lớp ảnh của carousel chồng lên nhau, đếm ngược
   đứng yên, gửi lời chúc không ăn. Nạp bằng thẻ <script src> thì chạy được
   cả file:// lẫn http://.

   String.raw để giữ nguyên các chuỗi thoát trong mã (ví dụ "\r\n" khi tạo
   file .ics). Khi sửa mã bên dưới, tránh dùng dấu ` và ${ vì cả khối nằm
   trong một chuỗi template. */
document.getElementById('dc-component').textContent = String.raw`
class Component extends DCLogic {
  state = { now: Date.now(), added: false, active: 0, strip: 0, collage: 0, layer: 0, wishName: "", wishText: "", wishes: [{ name: "Minh & Trang", text: "Chúc hai bạn trăm năm hạnh phúc, mãi bên nhau như ngày đầu." }] };

  srefs = [React.createRef(), React.createRef()];
  crefs = [React.createRef(), React.createRef()];
  lrefs = [React.createRef(), React.createRef()];

  fade(refs, active) {
    refs.forEach((r, i) => {
      const el = r.current;
      if (!el) return;
      const on = i === active;
      el.style.opacity = on ? 1 : 0;
      el.style.zIndex = on ? 1 : 0;
      el.style.pointerEvents = on ? "auto" : "none";
    });
  }

  applyStrip() {
    this.fade(this.srefs, this.state.strip);
    this.fade(this.crefs, this.state.collage);
    this.fade(this.lrefs, this.state.layer);
  }

  /* Hiệu ứng ảnh bay vào khi cuộn tới (js/reveal.js). Phải gọi từ đây vì
     runtime dựng lại trang sau khi reveal.js chạy, nên nó không tự gắn được;
     gọi lặp lại vô hại, phần nào gắn rồi thì bỏ qua. */
  moHieuUngCuon() { if (window.hieuUngCuon) window.hieuUngCuon(); }

  componentDidUpdate() { this.applyStrip(); this.moHieuUngCuon(); }

  componentDidMount() {
    this.t = setInterval(() => this.setState({ now: Date.now() }), 1000);
    this.applyStrip();
    this.moHieuUngCuon();
  }
  componentWillUnmount() { clearInterval(this.t); }

  pad(n) { return String(Math.max(0, n)).padStart(2, "0"); }

  renderVals() {
    const target = new Date("2026-11-14T10:00:00+07:00").getTime();
    let d = Math.max(0, target - this.state.now);
    const day = Math.floor(d / 86400000);
    const hr = Math.floor(d / 3600000) % 24;
    const min = Math.floor(d / 60000) % 60;
    const sec = Math.floor(d / 1000) % 60;

    const title = "Lễ cưới Khánh & Nhung";
    const loc = "Tư gia, Tà Lài, Tân Phú, Đồng Nai";
    const s = "20261114T030000Z", e = "20261114T070000Z";
    const gcalUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
      encodeURIComponent(title) + "&dates=" + s + "/" + e +
      "&location=" + encodeURIComponent(loc) +
      "&details=" + encodeURIComponent("Ngày vui của chúng mình, rất mong có bạn.");

    const addIcs = () => {
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//wedding//invite//VI",
        "BEGIN:VEVENT", "UID:khanh-nhung-20261114@invite",
        "DTSTAMP:" + s, "DTSTART:" + s, "DTEND:" + e,
        "SUMMARY:" + title, "LOCATION:" + loc,
        "DESCRIPTION:Ngày vui của chúng mình, rất mong có bạn.",
        "END:VEVENT", "END:VCALENDAR"
      ].join("\r\n");
      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url; a.download = "le-cuoi-khanh-nhung.ics";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      this.setState({ added: true });
    };

    const goStrip = (k) => this.setState((s) => ({ strip: (s.strip + k + 2) % 2 }));

    return Object.assign({}, {
      sref0: this.srefs[0], sref1: this.srefs[1],
      scounter: this.pad(this.state.strip + 1) + " / 02",
      sprev: () => goStrip(-1),
      snext: () => goStrip(1),
      cref0: this.crefs[0], cref1: this.crefs[1],
      ccounter: this.pad(this.state.collage + 1) + " / 02",
      cprev: () => this.setState((s) => ({ collage: (s.collage + 1) % 2 })),
      cnext: () => this.setState((s) => ({ collage: (s.collage + 1) % 2 })),
      wishName: this.state.wishName,
      wishText: this.state.wishText,
      wishes: this.state.wishes,
      onName: (e) => this.setState({ wishName: e.target.value }),
      onText: (e) => this.setState({ wishText: e.target.value }),
      sendWish: () => {
        const n = this.state.wishName.trim() || "Khách mời";
        const t = this.state.wishText.trim();
        if (!t) return;
        this.setState((s) => ({ wishes: [{ name: n, text: t }].concat(s.wishes), wishName: "", wishText: "" }));
      },
      lref0: this.lrefs[0], lref1: this.lrefs[1],
      lcounter: this.pad(this.state.layer + 1) + " / 02",
      lprev: () => this.setState((s) => ({ layer: (s.layer + 1) % 2 })),
      lnext: () => this.setState((s) => ({ layer: (s.layer + 1) % 2 })),
      gapPx: (this.props.gap ?? 0) + "px",
      dd: this.pad(day), hh: this.pad(hr), mm: this.pad(min), ss: this.pad(sec),
      gcalUrl, addIcs,
      hintText: this.state.added ? "Đã tải file .ics — mở để lưu vào lịch" : "Tải file .ics cho iPhone / Outlook"
    });
  }
}
`;
