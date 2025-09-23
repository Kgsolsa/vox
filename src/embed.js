(function () {
  const bilu = {
    init: function (config) {
      const commentDiv = document.getElementById("bilu-comment-section");
      if (!commentDiv) {
        console.error("Div with id 'bilu-comment-section' not found!");
        return;
      }

      const loadComments = function () {
        fetch(config.api + "/comments?url=" + encodeURIComponent(config.url))
          .then((response) => response.json())
          .then((data) => {
            const commentsHtml = data
              .map(
                (comment) =>
                  `<p><strong>${comment.user}</strong>: ${comment.comment} (${new Date(comment.timestamp).toLocaleString()})</p>`,
              )
              .join("");
            commentDiv.querySelector(".comments-list").innerHTML = commentsHtml;
          });
      };

      if (!commentDiv.querySelector("form")) {
        const form = document.createElement("form");
        form.innerHTML = `
          <input type="text" id="name" placeholder="Your Name" required />
          <textarea id="content" placeholder="Your Comment" required></textarea>
          <button type="submit">Submit</button>
          <div class="comments-list"></div>
        `;

        form.addEventListener("submit", function (e) {
          e.preventDefault();
          const name = form.querySelector("#name").value;
          const content = form.querySelector("#content").value;

          fetch(
            config.api + "/comments?url=" + encodeURIComponent(config.url),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user: name, comment: content }),
            },
          ).then(() => {
            loadComments();
          });
        });

        commentDiv.appendChild(form);
      }

      loadComments();
    },
  };

  window.bilu = bilu;
})();