import { useState } from "react";
import {
  PlusCircle,
  MinusCircle,
  Download,
  FileJson,
  Clipboard,
} from "lucide-react";

interface Assert {
  type: string;
  provider?: string;
  value: string;
}

interface Test {
  vars: {
    Question: string;
  };
}

interface Scenario {
  description: string;
  config: { assert: Assert[] }[];
  tests: Test[];
}

interface Prompt {
  role: string;
  content: string;
}

interface Config {
  description: string;
  scenarios: Scenario[];
  providers: string[];
  prompts: Prompt[];
  defaultTest: {
    assert: Assert[];
  };
}

function App() {
  const [config, setConfig] = useState<Config>({
    description: "",
    scenarios: [
      {
        description: "",
        config: [{ assert: [] }],
        tests: [{ vars: { Question: "" } }],
      },
    ],
    providers: [
      "openai:gpt-4-mini",
      "anthropic:messages:claude-3-5-sonnet-latest",
    ],
    prompts: [],
    defaultTest: {
      assert: [],
    },
  });
  const [generatedYaml, setGeneratedYaml] = useState<string>("");
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(generatedYaml)
      .then(() => {
        alert("YAML copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const addScenario = () => {
    setConfig({
      ...config,
      scenarios: [
        ...config.scenarios,
        {
          description: "",
          config: [{ assert: [] }],
          tests: [{ vars: { Question: "" } }],
        },
      ],
    });
  };

  const removeScenario = (index: number) => {
    const newScenarios = config.scenarios.filter((_, i) => i !== index);
    setConfig({ ...config, scenarios: newScenarios });
  };

  const addAssertion = (scenarioIndex: number) => {
    const newScenarios = [...config.scenarios];
    newScenarios[scenarioIndex].config[0].assert.push({
      type: "llm-rubric",
      provider: "anthropic:messages:claude-3-5-sonnet-latest",
      value: "",
    });
    setConfig({ ...config, scenarios: newScenarios });
  };

  const removeAssertion = (scenarioIndex: number, assertIndex: number) => {
    const newScenarios = [...config.scenarios];
    newScenarios[scenarioIndex].config[0].assert = newScenarios[
      scenarioIndex
    ].config[0].assert.filter((_, i) => i !== assertIndex);
    setConfig({ ...config, scenarios: newScenarios });
  };

  const addTest = (scenarioIndex: number) => {
    const newScenarios = [...config.scenarios];
    newScenarios[scenarioIndex].tests.push({ vars: { Question: "" } });
    setConfig({ ...config, scenarios: newScenarios });
  };

  const removeTest = (scenarioIndex: number, testIndex: number) => {
    const newScenarios = [...config.scenarios];
    newScenarios[scenarioIndex].tests = newScenarios[
      scenarioIndex
    ].tests.filter((_, i) => i !== testIndex);
    setConfig({ ...config, scenarios: newScenarios });
  };

  const updateScenario = (index: number, field: string, value: string) => {
    const newScenarios = [...config.scenarios];
    newScenarios[index] = { ...newScenarios[index], [field]: value };
    setConfig({ ...config, scenarios: newScenarios });
  };

  const updateAssertion = (
    scenarioIndex: number,
    assertIndex: number,
    field: string,
    value: string
  ) => {
    const newScenarios = [...config.scenarios];
    newScenarios[scenarioIndex].config[0].assert[assertIndex] = {
      ...newScenarios[scenarioIndex].config[0].assert[assertIndex],
      [field]: value,
    };
    setConfig({ ...config, scenarios: newScenarios });
  };

  const updateTest = (
    scenarioIndex: number,
    testIndex: number,
    value: string
  ) => {
    const newScenarios = [...config.scenarios];
    newScenarios[scenarioIndex].tests[testIndex].vars.Question = value;
    setConfig({ ...config, scenarios: newScenarios });
  };

  const generateYaml = () => {
    const yaml = `description: "${config.description}"
scenarios:
${config.scenarios
  .map(
    (scenario) => `  - description: "${scenario.description}"
    config:
    - assert:
${scenario.config[0].assert
  .map(
    (assert) => `      - type: "${assert.type}"
        ${assert.provider ? `provider: "${assert.provider}"` : ""}
        value: "${assert.value}"`
  )
  .join("\n")}
    tests:
${scenario.tests
  .map(
    (test) => `      - vars:
        Question: "${test.vars.Question}"`
  )
  .join("\n")}`
  )
  .join("\n")}
providers:
${config.providers.map((provider) => `  - "${provider}"`).join("\n")}
prompts:
- ${JSON.stringify(config.prompts)}
defaultTest:
  assert:
${config.defaultTest.assert
  .map(
    (assert) => `    - type: "${assert.type}"
      ${assert.provider ? `provider: "${assert.provider}"` : ""}
      value: "${assert.value}"`
  )
  .join("\n")}`;

    setGeneratedYaml(yaml);

    return yaml;
  };

  const downloadYaml = () => {
    const yaml = generateYaml();
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.yaml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updatePrompt = (index: number, field: string, value: string) => {
    const newPrompts = [...config.prompts];
    newPrompts[index] = { ...newPrompts[index], [field]: value };
    setConfig({ ...config, prompts: newPrompts });
  };

  const removePrompt = (index: number) => {
    const newPrompts = config.prompts.filter((_, i) => i !== index);
    setConfig({ ...config, prompts: newPrompts });
  };

  const addPrompt = () => {
    setConfig({
      ...config,
      prompts: [...config.prompts, { role: "system", content: "" }, { role: "user", content: "{{Question}}" }],
    });
  };

  return (
    <div className="h-screen bg-gray-100 py-8 px-4 flex gap-6">
      <div className="bg-white rounded-lg p-6 border w-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Promptfoo Builder
          </h1>
          <div className="flex gap-4">
            <button
              onClick={generateYaml}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <FileJson size={20} />
              Generate YAML
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={config.description}
              onChange={(e) =>
                setConfig({
                  ...config,
                  description: e.target.value,
                })
              }
              className="w-full p-2 border rounded-md"
              placeholder="Enter description"
            />
          </div>

          <div className="space-y-6">

          <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Prompts</h2>
              <button
                onClick={addPrompt}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <PlusCircle size={20} />
                Add Prompt
              </button>
            </div>
            <div>
              {config.prompts.map((prompt, promptIndex) => (
                <div key={promptIndex} className="flex gap-2 mb-2">
                  <select
                    value={prompt.role}
                    onChange={(e) =>
                      updatePrompt(promptIndex, "role", e.target.value)
                    }
                    className="p-2 border rounded-md"
                  >
                    <option value="system">system</option>
                    <option value="user">user</option>
                    <option value="assistant">assistant</option>
                  </select>
                  <input
                    type="text"
                    value={prompt.content}
                    onChange={(e) =>
                      updatePrompt(promptIndex, "content", e.target.value)
                    }
                    className="flex-1 p-2 border rounded-md"
                    placeholder="Prompt content"
                  />
                  <button
                    onClick={() => removePrompt(promptIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <MinusCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Scenarios</h2>
              <button
                onClick={addScenario}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <PlusCircle size={20} />
                Add Scenario
              </button>
            </div>

            {config.scenarios.map((scenario, scenarioIndex) => (
              <div
                key={scenarioIndex}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">
                    Scenario {scenarioIndex + 1}
                  </h3>
                  <button
                    onClick={() => removeScenario(scenarioIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <MinusCircle size={20} />
                  </button>
                </div>

                <input
                  type="text"
                  value={scenario.description}
                  onChange={(e) =>
                    updateScenario(scenarioIndex, "description", e.target.value)
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="Scenario description"
                />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Assertions
                    </h4>
                    <button
                      onClick={() => addAssertion(scenarioIndex)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <PlusCircle size={16} />
                    </button>
                  </div>
                  {scenario.config[0].assert.map((assert, assertIndex) => (
                    <div key={assertIndex} className="flex gap-2 mb-2">
                      <select
                        value={assert.type}
                        onChange={(e) =>
                          updateAssertion(
                            scenarioIndex,
                            assertIndex,
                            "type",
                            e.target.value
                          )
                        }
                        className="p-2 border rounded-md"
                      >
                        <option value="llm-rubric">llm-rubric</option>
                        <option value="icontains">icontains</option>
                        <option value="not-icontains">not-icontains</option>
                      </select>
                      {assert.type === "llm-rubric" && (
                        <input
                          type="text"
                          value={assert.provider}
                          onChange={(e) =>
                            updateAssertion(
                              scenarioIndex,
                              assertIndex,
                              "provider",
                              e.target.value
                            )
                          }
                          className="flex-1 p-2 border rounded-md"
                          placeholder="Provider"
                        />
                      )}
                      <input
                        type="text"
                        value={assert.value}
                        onChange={(e) =>
                          updateAssertion(
                            scenarioIndex,
                            assertIndex,
                            "value",
                            e.target.value
                          )
                        }
                        className="flex-1 p-2 border rounded-md"
                        placeholder="Value"
                      />
                      <button
                        onClick={() =>
                          removeAssertion(scenarioIndex, assertIndex)
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <MinusCircle size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Tests</h4>
                    <button
                      onClick={() => addTest(scenarioIndex)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <PlusCircle size={16} />
                    </button>
                  </div>
                  {scenario.tests.map((test, testIndex) => (
                    <div key={testIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={test.vars.Question}
                        onChange={(e) =>
                          updateTest(scenarioIndex, testIndex, e.target.value)
                        }
                        className="flex-1 p-2 border rounded-md"
                        placeholder="Test question"
                      />
                      <button
                        onClick={() => removeTest(scenarioIndex, testIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <MinusCircle size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full bg-white p-6 rounded-md border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Generated YAML
          </h2>
          <button
            onClick={downloadYaml}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download size={20} />
            Download YAML
          </button>
        </div>
        {generatedYaml && (
          <div className="relative">
            <textarea
              value={generatedYaml}
              readOnly
              rows={29}
              className="w-full h-full p-4 border border-black/10 rounded-md bg-black/10 font-mono text-sm"
            />

            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
              title="Copy to Clipboard"
            >
              <Clipboard size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
