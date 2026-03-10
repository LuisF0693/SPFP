// integrations/clickup.mjs — ClickUp API helper

import axios from 'axios';
import { CLICKUP } from '../config.mjs';

const api = axios.create({
  baseURL: 'https://api.clickup.com/api/v2',
  headers: { Authorization: CLICKUP.API_TOKEN, 'Content-Type': 'application/json' },
});

export async function getTask(taskId) {
  const { data } = await api.get(`/task/${taskId}`);
  return data;
}

export async function createTask(listId, payload) {
  const { data } = await api.post(`/list/${listId}/task`, payload);
  return data;
}

export async function postComment(taskId, text) {
  await api.post(`/task/${taskId}/comment`, { comment_text: text });
}

export async function updateTaskStatus(taskId, status) {
  await api.put(`/task/${taskId}`, { status });
}

export function getCustomField(task, fieldId) {
  const f = (task.custom_fields || []).find(cf => cf.id === fieldId);
  if (!f || f.value === undefined || f.value === null) return null;
  // dropdown: value é o orderindex, type_config.options tem os detalhes
  if (f.type === 'drop_down' && f.type_config?.options) {
    const opt = f.type_config.options.find(o => String(o.orderindex) === String(f.value));
    return opt ? opt.name : null;
  }
  return f.value;
}

export function getCustomFieldId(task, fieldId) {
  const f = (task.custom_fields || []).find(cf => cf.id === fieldId);
  if (!f || f.value === undefined || f.value === null) return null;
  if (f.type === 'drop_down' && f.type_config?.options) {
    const opt = f.type_config.options.find(o => String(o.orderindex) === String(f.value));
    return opt ? opt.id : null;
  }
  return f.value;
}
