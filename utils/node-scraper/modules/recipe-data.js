const { fetchHtml } = require('./http');

/**
 * Fetches a single recipe page and extracts its extra data
 * (difficulty, rations, time, image).
 *
 * Returns `{ ok: true, data }` on success or `{ ok: false }` when the fetch
 * fails after retries. Distinguishing the two lets the orchestrator tell an
 * absent field apart from a failed request, so failures never silently
 * poison the dataset and a single bad recipe never aborts the run.
 */
module.exports = async (recipe) => {
  try {
    const $ = await fetchHtml(recipe.link);

    const getRecipeData = (sections) => {
      let time;
      let rations;
      let difficulty;

      sections.each(function (key) {
        if (key === 1) {
          $(this)
            .find('p')
            .each(function () {
              const text = $(this).text();

              if (text.includes('Dificultad:')) {
                difficulty = text.split('Dificultad:')[1].trim();
              } else if (text.includes('Raciones:')) {
                rations = text.split('Raciones:')[1].trim();
              } else if (text.includes('Tiempo:')) {
                time = text.split('Tiempo:')[1].trim();
              }
            });
        }
      });

      return {
        difficulty,
        rations,
        time,
      };
    };

    // Some recipes are inside recipes ...
    if ($('.av-share-box').length) {
      const newRecipeLink = $('a.avia-button').attr('href');
      const $newRecipeHtml = await fetchHtml(newRecipeLink);

      return {
        ok: true,
        data: {
          ...getRecipeData(
            $newRecipeHtml('.entry-content-wrapper .av_textblock_section')
          ),
          image: $('.entry-content blockquote img').attr('src'),
        },
      };
    }

    return {
      ok: true,
      data: {
        ...getRecipeData($('.entry-content-wrapper .av_textblock_section')),
        image: $('.avia_image img').length
          ? $('.avia_image img').attr('src')
          : $('.avia_image').attr('src'),
      },
    };
  } catch (error) {
    console.error(`Failed to fetch recipe ${recipe.link}: ${error.message}`);
    return { ok: false };
  }
};
