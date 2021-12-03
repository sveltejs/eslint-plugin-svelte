<script>
  import { categories } from "./scripts/linter.js"

  export let rules = {}
  let categoryState = Object.fromEntries(
    categories.map((c) => {
      return [
        c.title,
        {
          close: true,
        },
      ]
    }),
  )
  function onAllClick(category, e) {
    const newRules = Object.assign({}, rules)
    for (const rule of category.rules) {
      if (e.target.checked) {
        newRules[rule.ruleId] = "error"
      } else {
        delete newRules[rule.ruleId]
      }
    }
    rules = newRules
  }
  function onClick(ruleId, e) {
    const newRules = Object.assign({}, rules)
    if (e.target.checked) {
      newRules[ruleId] = "error"
    } else {
      delete newRules[ruleId]
    }
    rules = newRules
  }
  function isErrorState(rules, ruleId) {
    return rules[ruleId] === "error" || rules[ruleId] === 2
  }
</script>

<div class="rules-settings">
  <ul class="categories">
    {#each categories as category (category.title)}
      {#if category.rules.length}
        <li class="category">
          <button
            class="category-button"
            class:category-button--close={categoryState[category.title].close}
            on:click={() => {
              categoryState = Object.fromEntries(
                categories.map((c) => {
                  const close = categoryState[c.title].close
                  return [
                    c.title,
                    {
                      close: category.title === c.title ? !close : close,
                    },
                  ]
                }),
              )
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="10"
              viewBox="0 0 10 10"
              width="10"
            >
              <path d="M2.5 10l5-5-5-5v10z" fill="#ddd" />
            </svg>
          </button>
          <div class="category-title-wrapper">
            <label class="category-title">
              <input
                type="checkbox"
                checked={category.rules.every((rule) =>
                  isErrorState(rules, rule.ruleId),
                )}
                indeterminate={!category.rules.every((rule) =>
                  isErrorState(rules, rule.ruleId),
                ) &&
                  !category.rules.every(
                    (rule) => !isErrorState(rules, rule.ruleId),
                  )}
                on:input={(e) => onAllClick(category, e)}
              />
              {category.title}
            </label>
          </div>

          {#if !categoryState[category.title].close}
            <ul class="rules">
              {#each category.rules as rule (rule.ruleId)}
                <li class="rule">
                  <label>
                    <input
                      type="checkbox"
                      checked={isErrorState(rules, rule.ruleId)}
                      on:input={(e) => onClick(rule.ruleId, e)}
                    />
                    {rule.ruleId}
                  </label>
                  <a href={rule.url} target="_blank"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      x="0px"
                      y="0px"
                      viewBox="0 0 100 100"
                      width="15"
                      height="15"
                      class="icon outbound"
                    >
                      <path
                        fill="currentColor"
                        d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
                      />
                      <polygon
                        fill="currentColor"
                        points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
                      /></svg
                    ></a
                  >
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/if}
    {/each}
  </ul>
</div>

<style>
  .rules-settings {
    height: 100%;
    overflow: auto;
    width: 25%;
    box-sizing: border-box;
  }

  .categories {
    font-size: 14px;
    list-style-type: none;
  }
  .category {
    position: relative;
  }
  .category-button {
    position: absolute;
    left: -24px;
    top: 2px;

    background-color: transparent;
    color: #ddd;
    border: none;
    appearance: none;
    cursor: pointer;
    padding: 0;
  }
  .category-button--close {
    transform: rotate(90deg);
  }

  .category-title {
    font-size: 14px;
    font-weight: bold;
  }

  .rules {
    padding-left: 0;
  }

  .rule {
    font-size: 12px;
    line-height: 24px;
    vertical-align: top;
    list-style-type: none;
    display: flex;
  }

  .rule a {
    margin-left: auto;
  }

  a {
    text-decoration: none;
  }

  .category {
    color: #fff;
  }
</style>
