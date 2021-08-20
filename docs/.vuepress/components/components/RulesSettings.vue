<template>
  <div class="rules-settings">
    <div class="tools">
      <div class="tools-title" @click="state.toolsClose = !state.toolsClose">
        Tools
        <button
          class="tools-button"
          :class="{ 'tools-button--close': state.toolsClose }"
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
      </div>
      <template v-if="!state.toolsClose">
        <div class="tool">
          <button class="tool-button" @click="onAllOffClick">
            Turn OFF All Rules
          </button>
        </div>
        <div class="tool">
          <label>
            <span class="tool-label">Filter:</span>
            <input
              v-model="filterValue"
              type="search"
              placeholder="Rule Filter"
              class="tool-form"
            />
          </label>
        </div>
      </template>
    </div>
    <ul class="categories">
      <template v-for="category in categories">
        <li
          v-if="category.rules.length"
          :key="category.title"
          class="category"
          :class="category.classes"
        >
          <button
            class="category-button"
            :class="{
              'category-button--close': categoryState[category.title].close,
            }"
            @click="
              categoryState[category.title].close =
                !categoryState[category.title].close
            "
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
                :checked="
                  category.rules.every((rule) => isErrorState(rule.ruleId))
                "
                type="checkbox"
                :indeterminate.prop="
                  !category.rules.every((rule) => isErrorState(rule.ruleId)) &&
                  !category.rules.every((rule) => !isErrorState(rule.ruleId))
                "
                @input="onAllClick(category, $event)"
              />
              {{ category.title }}
            </label>
          </div>

          <ul v-show="!categoryState[category.title].close" class="rules">
            <li
              v-for="rule in filterRules(category.rules)"
              :key="rule.ruleId"
              class="rule"
              :class="rule.classes"
            >
              <label>
                <input
                  :checked="isErrorState(rule.ruleId)"
                  type="checkbox"
                  @input="onClick(rule.ruleId, $event)"
                />
                {{ rule.ruleId }}
              </label>
              <a :href="rule.url" target="_blank"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  x="0px"
                  y="0px"
                  viewBox="0 0 100 100"
                  width="15"
                  height="15"
                >
                  <path
                    fill="currentColor"
                    d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
                  />
                  <polygon
                    fill="currentColor"
                    points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
                  /></svg
              ></a>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { categories } from "../rules"

export default {
  name: "RulesSettings",
  props: {
    rules: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      categoryState: Object.fromEntries(
        categories.map((c) => {
          return [
            c.title,
            {
              close: true,
            },
          ]
        }),
      ),
      state: {
        toolsClose: true,
      },
      filterValue: "",
    }
  },
  computed: {
    categories() {
      return categories.map((c) => {
        let rules = this.filterRules(c.rules)
        if (this.filterValue) {
          rules = rules.filter((r) => r.ruleId.includes(this.filterValue))
        }
        return {
          ...c,
          rules,
        }
      })
    },
  },
  methods: {
    filterRules(rules) {
      return rules.filter((rule) => rule.ruleId !== "jsonc/auto")
    },
    onAllClick(category, e) {
      const rules = Object.assign({}, this.rules)
      for (const rule of this.filterRules(category.rules)) {
        if (e.target.checked) {
          rules[rule.ruleId] = "error"
        } else {
          delete rules[rule.ruleId]
        }
      }
      this.$emit("update:rules", rules)
    },
    onAllOffClick() {
      this.$emit("update:rules", {})
    },
    onClick(ruleId, e) {
      const rules = Object.assign({}, this.rules)
      if (e.target.checked) {
        rules[ruleId] = "error"
      } else {
        delete rules[ruleId]
      }
      this.$emit("update:rules", rules)
    },
    isErrorState(ruleId) {
      return this.rules[ruleId] === "error" || this.rules[ruleId] === 2
    },
  },
}
</script>

<style scoped>
.tools {
  background-color: #222;
}

.tool {
  display: flex;
}

.tool,
.tools-title {
  padding: 4px;
}

.tool > label {
  display: flex;
  width: 100%;
}

.tool > button {
  margin: auto;
}

.tool-label {
  width: 3.5rem;
  flex-shrink: 0;
}

.tool-form {
  width: 100%;
}

.tools-button {
  background-color: transparent;
  color: #ddd;
  border: none;
  appearance: none;
  cursor: pointer;
  padding: 0;
}

.tools-button--close {
  transform: rotate(90deg);
}

.filter .tool-label {
  color: #ddd;
}

.categories {
  font-size: 14px;
  list-style-type: none;
}

.category {
  position: relative;
  color: #fff;
}

.category-button {
  position: absolute;
  left: -12px;
  top: 4px;
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

.eslint-plugin-svelte__category .category-title,
.eslint-plugin-svelte__rule a {
  color: #40b3ff;
}

.eslint-category .category-title,
.eslint-rule a {
  color: #8080f2;
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
  display: inline-flex;
  align-items: center;
}

a {
  text-decoration: none;
}
</style>
