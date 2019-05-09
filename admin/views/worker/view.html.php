<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Worker View for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosViewWorker extends JView
{
    /**
     * display method of Worker view
     * @return void
     **/
    public function display($tpl = null)
    {

        $worker = &$this->get('Data');

        $isNew = ($worker->id < 1);

        $text = $isNew ? JText::_('New') : JText::_('Edit');
        JToolBarHelper::title(JText::_('Worker') . ': <small><small>[ ' . $text . ' ]</small></small>');
        if ($isNew) {
            JToolBarHelper::save('save', 'Register');
            JToolBarHelper::cancel('cancel', 'Close');
            // We'll use a separate template for new workers: default_add
            // $tpl = 'add';
        } else {
            // for existing workers the button is renamed `close`
            JToolBarHelper::save('save', 'Update');
            JToolBarHelper::cancel('cancel', 'Close');
        }

        $this->assignRef('worker', $worker);
        $this->assignRef('isNew', $isNew);

        parent::display($tpl);
    }
}
