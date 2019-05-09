<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Items Model for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosModelItems extends JModel
{
    /**
     * Items data array
     * @var array
     */
    public $_data;

    /**
     * Items total
     * @var integer
     */
    public $_total;

    /**
     * Pagination object
     * @var object
     */
    public $_pagination;

    /**
     * Constructor prepares for pagination
     * @return void
     */
    public function __construct()
    {
        parent::__construct();

        $mainframe = JFactory::getApplication();

        // Get pagination request variables
        $limit      = $mainframe->getUserStateFromRequest('global.list.limit', 'limit', $mainframe->getCfg('list_limit'), 'int');
        $limitstart = JRequest::getVar('limitstart', 0, '', 'int');

        // In case limit has been changed, adjust it
        $limitstart = ($limit != 0 ? (floor($limitstart / $limit) * $limit) : 0);

        $this->setState('limit', $limit);
        $this->setState('limitstart', $limitstart);
    }

    /**
     * Build and return the query
     * @return string SQL Query
     */
    public function _buildQuery()
    {
        $where = ';';
        $query = 'SELECT * FROM `#__pvdemos` ';

        return $query . $where;
    }

    /**
     * Retrieve, store, and returns Items data
     * @return array Items Data
     */
    public function getData()
    {
        // if data hasn't already been obtained, load it
        if (empty($this->_data)) {
            $query       = $this->_buildQuery();
            $this->_data = $this->_getList($query, $this->getState('limitstart'), $this->getState('limit'));
        }

        return $this->_data;
    }

    /**
     * Retrieve, store, and return number of Items rows
     * @return int number of rows
     */
    public function getTotal()
    {
        // Load the content if it doesn't already exist
        if (empty($this->_total)) {
            $query        = $this->_buildQuery();
            $this->_total = $this->_getListCount($query);
        }

        return $this->_total;
    }

    /**
     * Retrieve, store and return a current JPagination object of Items
     * @return array Array of objects containing the data from the database
     */
    public function getPagination()
    {
        // Load the content if it doesn't already exist
        if (empty($this->_pagination)) {
            $this->_pagination = new JPagination($this->getTotal(), $this->getState('limitstart'), $this->getState('limit'));
        }

        return $this->_pagination;
    }
}
